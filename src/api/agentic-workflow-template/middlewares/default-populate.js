'use strict';

const landingCardPopulate = {
  populate: {
    image: true,
  },
};

const defaultPopulate = {
  Hero: {
    populate: {
      image: true,
      HardCTA: true,
      SoftCTA: true,
      stats: true,
    },
  },
  SEO: { populate: '*' },
  Steps: {
    populate: {
      step: { populate: '*' },
    },
  },
  detail_section: { populate: '*' },
  Systemprompt: { populate: '*' },
  faq: { populate: '*' },
  demo_use_cases: {
    populate: {
      image: true,
    },
  },
  articles: {
    populate: {
      cover: true,
      category: true,
    },
  },
  capabilities: {
    populate: {
      items: landingCardPopulate,
    },
  },
  audience: {
    populate: {
      items: landingCardPopulate,
    },
  },
  transforms: {
    populate: {
      rows: landingCardPopulate,
    },
  },
  modules: {
    populate: {
      items: {
        populate: {
          screenshot: true,
        },
      },
    },
  },
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (!ctx.query.populate) {
      ctx.query.populate = defaultPopulate;
    }

    await next();
  };
};
