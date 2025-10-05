// src/handlers/pollHandler.js
import { EVENTS } from '../utils/constant.js';
import Poll from '../models/Poll.js';
import redisClient from '../config/redisClient.js';
import { getParticipants } from '../store/index.js'; // We still get participants from the in-memory store
import { v4 as uuidv4 } from 'uuid';

// --- Redis Helper Functions ---

const createLivePoll = async ({ question, options, correctOptionIndex, teacherSocketId }) => {
    const pollOptions = options.map(opt => ({ id: uuidv4(), text: opt }));
    const correctOptionId = pollOptions[correctOptionIndex]?.id;

    const pollData = {
        question,
        correctOptionId,
        teacherSocketId,
        isActive: 'true'
    };
    
    // Store poll details and options in Redis Hashes
    await redisClient.hSet('active_poll', pollData);
    await redisClient.set('active_poll:options', JSON.stringify(pollOptions));
};

const getActivePoll = async () => {
    const [pollData, optionsJSON] = await Promise.all([
        redisClient.hGetAll('active_poll'),
        redisClient.get('active_poll:options')
    ]);

    if (!pollData || !optionsJSON) return null;
    
    return {
        ...pollData,
        options: JSON.parse(optionsJSON)
    };
};

const clearActivePoll = async () => {
    await redisClient.del('active_poll', 'active_poll:options', 'active_poll:results', 'active_poll:submissions');
};

// --- Main Handler ---

export const pollHandler = (io, socket) => {
  const pollDuration = (process.env.POLL_DURATION_SECONDS || 60) * 1000;
  let pollEndTimer = null; // Use a local timer that can be cleared

  const endPoll = async () => {
    const livePoll = await getActivePoll();
    if (!livePoll || livePoll.isActive !== 'true') return;

    // Set poll to inactive in Redis to prevent race conditions
    await redisClient.hSet('active_poll', 'isActive', 'false');
    
    const [results, submissions] = await Promise.all([
        redisClient.hGetAll('active_poll:results'),
        redisClient.hGetAll('active_poll:submissions')
    ]);

    const finalResults = {
      question: livePoll.question,
      options: livePoll.options,
      results: results || {},
      totalSubmissions: Object.keys(submissions || {}).length,
      correctOptionId: livePoll.correctOptionId,
    };
    
    try {
      const pollToSave = new Poll(finalResults);
      await pollToSave.save();
      console.log('✅ Poll saved to MongoDB.');
    } catch (error) {
      console.error('❌ Error saving poll:', error);
    }
    
    io.emit(EVENTS.POLL_RESULTS, finalResults);
    await clearActivePoll();
    if(pollEndTimer) clearTimeout(pollEndTimer);
  };

  const handleAskQuestion = async ({ question, options, correctOptionIndex }) => {
    // ASYNC: Now interacts with Redis
    const teacherSocketId = (await redisClient.hGetAll('active_poll')).teacherSocketId; // A simple way to get teacher ID
    if (socket.id !== teacherSocketId && getParticipants().find(p => p.socketId === socket.id)?.role !== 'teacher') return;

    await createLivePoll({ question, options, correctOptionIndex, teacherSocketId: socket.id });
    const newPoll = await getActivePoll();
    
    io.emit(EVENTS.POLL_QUESTION, { question: newPoll.question, options: newPoll.options });
    
    pollEndTimer = setTimeout(endPoll, pollDuration);
  };

  const handleSubmitAnswer = async ({ optionId }) => {
    // ASYNC: Now interacts with Redis
    const pollIsActive = await redisClient.hGet('active_poll', 'isActive');
    if (pollIsActive !== 'true') return;

    const hasVoted = await redisClient.hGet('active_poll:submissions', socket.id);
    if (hasVoted) return;

    // Record submission and increment vote count atomically
    await Promise.all([
        redisClient.hSet('active_poll:submissions', socket.id, optionId),
        redisClient.hIncrBy('active_poll:results', optionId, 1)
    ]);

    socket.emit('student:answer_confirmed');

    // Send live results to the teacher
    const liveResults = await redisClient.hGetAll('active_poll:results');
    const teacherSocketId = await redisClient.hGet('active_poll', 'teacherSocketId');
    io.to(teacherSocketId).emit(EVENTS.POLL_RESULTS, { ...(await getActivePoll()), results: liveResults });

    const studentCount = getParticipants().filter(p => p.role === 'student').length;
    const submissionCount = await redisClient.hLen('active_poll:submissions');
    if (studentCount > 0 && submissionCount === studentCount) {
        endPoll();
    }
  };
  
  // ... other handlers like handleGetPollHistory (which uses MongoDB) are fine.
  
  socket.on(EVENTS.TEACHER_ASK_QUESTION, handleAskQuestion);
  socket.on(EVENTS.STUDENT_SUBMIT_ANSWER, handleSubmitAnswer);
  // ... other listeners
};