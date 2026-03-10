const normalizeUserName = (name = "") => name.trim().replace(/\s+/g, " ");

const getNormalizedUserNameKey = (name = "") =>
  normalizeUserName(name).toLowerCase();

module.exports = {
  getNormalizedUserNameKey,
  normalizeUserName,
};
