import state, { setTeacherSocketId, addUser, removeUser, getParticipants } from '../store/index.js';
import { EVENTS } from '../utils/constant.js';

export const userHandler = (io, socket) => {
  /**
   * Handles a new user joining the session.
   * The role is determined by the server based on authentication status.
   */
  const handleUserJoin = ({ name }) => {
    let role;
    let userName = name;

    // Security check: If socket.user exists, it means they have a valid session
    // and are an authenticated teacher.
    if (socket.user) {
      role = 'teacher';
      userName = "Teacher"; // Use a standard name for the authenticated teacher
      setTeacherSocketId(socket.id);
      console.log(`✅ Authenticated Teacher joined with socket ID ${socket.id}`);
    } else {
      // Any other connection is treated as an anonymous student.
      role = 'student';
      if (!userName) {
        console.log('Student tried to join without a name. Denied.');
        return; // Prevent students with no name from joining
      }
      console.log(`🧑‍🎓 Student '${name}' joined with socket ID ${socket.id}`);
    }

    // Add the user to our in-memory store
    addUser(socket.id, { name: userName, role });

    // Send the updated participant list to the teacher
    if (state.teacherSocketId) {
      io.to(state.teacherSocketId).emit(EVENTS.PARTICIPANTS_LIST, getParticipants());
    }
    
    // If a poll is currently active, send it to the newly joined user
    // (This part will be updated when we move live poll state to Redis)
    // if (state.poll.isActive) {
    //   socket.emit(EVENTS.POLL_QUESTION, {
    //     question: state.poll.question,
    //     options: state.poll.options,
    //   });
    // }
  };

  /**
   * Handles a user disconnecting from the session.
   */
  const handleDisconnect = () => {
    const user = removeUser(socket.id); // Get the user and remove them from the store
    if (!user) return;
    
    console.log(`🔌 User disconnected: ${user.name}`);

    // If the disconnected user was the teacher, clear their ID
    if (user.role === 'teacher') {
      setTeacherSocketId(null);
      console.log('Teacher disconnected. Session is now hostless.');
      // Optional: You could end any active poll here.
    }

    // Always notify the teacher (if one exists) that the participant list has changed
    if (state.teacherSocketId) {
      io.to(state.teacherSocketId).emit(EVENTS.PARTICIPANTS_LIST, getParticipants());
    }
  };

  // Register event listeners for this socket connection
  socket.on(EVENTS.USER_JOIN, handleUserJoin);
  socket.on(EVENTS.disconnect, handleDisconnect);
};