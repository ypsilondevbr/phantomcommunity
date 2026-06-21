const { isOwner, isAdmin } = require('./permissions');
const { PermissionsBitField } = require('discord.js');

/**
 * Validador de Segurança para interceptar ações da IA
 */
class SecurityValidator {
    /**
     * Valida se a IA pode criar um cargo com determinadas permissões.
     * @param {GuildMember} requester Membro que solicitou a ação
     * @param {Object} roleData Dados do cargo a ser criado
     */
    static validateRoleCreation(requester, roleData) {
        if (!isAdmin(requester) && !isOwner(requester.guild, requester)) {
            throw new Error("Você não tem permissão para criar cargos.");
        }

        // Bloquear criação de cargo de Administrador por IA se não for Owner
        if (roleData.permissions) {
            const perms = new PermissionsBitField(roleData.permissions);
            if (perms.has(PermissionsBitField.Flags.Administrator) && !isOwner(requester.guild, requester)) {
                throw new Error("Ação bloqueada: Apenas o dono do servidor pode solicitar criação de cargos com permissão de Administrador via IA.");
            }
        }
        return true;
    }

    /**
     * Valida ações destrutivas (deleção em massa, banimentos, etc)
     */
    static requiresConfirmation(actionType, targetCount) {
        const destructiveActions = ['DELETE_CHANNELS', 'DELETE_ROLES', 'MASS_BAN', 'MASS_KICK'];
        if (destructiveActions.includes(actionType) && targetCount > 1) {
            return true;
        }
        return false;
    }
}

module.exports = SecurityValidator;
