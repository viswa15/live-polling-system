// This store now ONLY manages the in-memory user list and teacher socket ID for a single server instance.
// For full production scalability, this user data would also be moved to a shared store like Redis.

const state = {
  teacherSocketId: null,
  users: new Map(), // Map<socketId, { name: string, role: string }>
};

/**
 * Sets the socket ID for the current teacher.
 * @param {string | null} socketId - The socket ID of the teacher.
 */
export const setTeacherSocketId = (socketId) => {
  state.teacherSocketId = socketId;
};

/**
 * Adds a new user to the in-memory map.
 * @param {string} socketId - The socket ID of the user.
 * @param {object} userData - The user's data { name, role }.
 */
export const addUser = (socketId, userData) => {
  state.users.set(socketId, userData);
};

/**
 * Removes a user from the in-memory map by their socket ID.
 * @param {string} socketId - The socket ID of the user to remove.
 * @returns {object | undefined} The user object that was removed.
 */
export const removeUser = (socketId) => {
  const user = state.users.get(socketId);
  if (user) {
    state.users.delete(socketId);
  }
  return user;
};

/**
 * Retrieves a list of all currently connected participants.
 * @returns {Array<object>} An array of participant objects.
 */
export const getParticipants = () => {
  const participants = [];
  for (const [socketId, user] of state.users.entries()) {
    participants.push({ socketId, ...user });
  }
  return participants;
};

/**
 * Kicks a student user by removing them from the map.
 * @param {string} socketId - The socket ID of the student to kick.
 * @returns {object | null} The kicked user object or null if not found/not a student.
 */
export const kickUser = (socketId) => {
  const user = state.users.get(socketId);
  if (user && user.role === 'student') {
    state.users.delete(socketId);
    return user;
  }
  return null;
};

export default state;