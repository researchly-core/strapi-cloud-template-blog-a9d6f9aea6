'use strict';

/**
 * multi-agent-workflow service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::multi-agent-workflow.multi-agent-workflow');
