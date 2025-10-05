// src/utils/constants.js
export const EVENTS = {
  connection: 'connection',
  disconnect: 'disconnect',
  
  // Client to Server
  USER_JOIN: 'user:join',
  TEACHER_ASK_QUESTION: 'teacher:ask_question',
  STUDENT_SUBMIT_ANSWER: 'student:submit_answer',
  POLL_GET_HISTORY: 'poll:get_history',
  PARTICIPANTS_GET: 'participants:get',
  USER_KICK: 'user:kick',

  // Server to Client
  NOTIFY_USER_JOINED: 'notify:user_joined',
  NOTIFY_USER_LEFT: 'notify:user_left',
  POLL_QUESTION: 'poll:question',
  POLL_RESULTS: 'poll:results',
  POLL_HISTORY: 'poll:history',
  PARTICIPANTS_LIST: 'participants:list',
  USER_KICKED: 'user:kicked',
  USER_KICKED_SUCCESS: 'user:kicked_success',
  TIME_UPDATE: 'timeUpdate',
  TIME_UP: 'timeUp',
  ERROR: 'error:generic'
};