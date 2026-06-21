const { PermissionsBitField } = require('discord.js');

function hasPermission(member, permission) {
    if (!member) return false;
    return member.permissions.has(permission);
}

function isOwner(guild, member) {
    if (!guild || !member) return false;
    return guild.ownerId === member.id;
}

function isAdmin(member) {
    if (!member) return false;
    return hasPermission(member, PermissionsBitField.Flags.Administrator);
}

module.exports = {
    hasPermission,
    isOwner,
    isAdmin
};
