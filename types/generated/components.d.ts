import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAgentCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_agent_ctas';
  info: {
    displayName: 'agent_cta';
  };
  attributes: {
    cta: Schema.Attribute.String;
    headline: Schema.Attribute.String;
    subheadline: Schema.Attribute.Text;
  };
}

export interface SharedAuthorsNote extends Struct.ComponentSchema {
  collectionName: 'components_shared_authors_notes';
  info: {
    displayName: 'AuthorsNote';
  };
  attributes: {
    Author: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Note: Schema.Attribute.Blocks;
  };
}

export interface SharedCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_ctas';
  info: {
    description: '';
    displayName: 'CTA-Section';
  };
  attributes: {
    ctaDescription: Schema.Attribute.String;
    ctaTitle: Schema.Attribute.String;
    primaryCTA: Schema.Attribute.Component<'shared.cta-button', false>;
    secondaryCTA: Schema.Attribute.Component<'shared.cta-button', false>;
  };
}

export interface SharedCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_buttons';
  info: {
    displayName: 'ctaButton';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String;
  };
}

export interface SharedFaq extends Struct.ComponentSchema {
  collectionName: 'components_shared_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    Answer: Schema.Attribute.Blocks;
    AnswerMD: Schema.Attribute.RichText;
    Question: Schema.Attribute.String;
  };
}

export interface SharedFeatures extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    displayName: 'Features';
    icon: 'apps';
  };
  attributes: {
    headline: Schema.Attribute.String;
    InfoCard: Schema.Attribute.Component<'shared.info-card', true>;
    subheadline: Schema.Attribute.Blocks;
  };
}

export interface SharedFlourishLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_flourish_links';
  info: {
    displayName: 'flourishLink';
  };
  attributes: {
    flourish: Schema.Attribute.String;
  };
}

export interface SharedHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_sections';
  info: {
    description: '';
    displayName: 'Hero Section';
  };
  attributes: {
    bubble: Schema.Attribute.String & Schema.Attribute.Required;
    HardCTA: Schema.Attribute.Component<'shared.cta-button', false>;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    SoftCTA: Schema.Attribute.Component<'shared.cta-button', true>;
    subheadline: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedHolder extends Struct.ComponentSchema {
  collectionName: 'components_shared_holders';
  info: {
    displayName: 'holder';
  };
  attributes: {
    desc: Schema.Attribute.String;
    test: Schema.Attribute.String;
  };
}

export interface SharedHolder1 extends Struct.ComponentSchema {
  collectionName: 'components_shared_holder_1s';
  info: {
    description: '';
    displayName: 'holder_1';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    link: Schema.Attribute.String;
    use_case_description: Schema.Attribute.Text;
    use_case_title: Schema.Attribute.String;
  };
}

export interface SharedHowItWorks extends Struct.ComponentSchema {
  collectionName: 'components_shared_how_it_works';
  info: {
    displayName: 'how it works';
  };
  attributes: {
    step: Schema.Attribute.Component<'shared.text-image-section', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedInfoCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_info_cards';
  info: {
    description: '';
    displayName: 'InfoCard';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedInfoSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_info_sections';
  info: {
    displayName: 'InfoSection';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    headline: Schema.Attribute.String;
    InfoCard: Schema.Attribute.Component<'shared.info-card', true>;
  };
}

export interface SharedInsights extends Struct.ComponentSchema {
  collectionName: 'components_shared_insights';
  info: {
    displayName: 'Insights';
  };
  attributes: {
    publication_id: Schema.Attribute.String;
  };
}

export interface SharedInsightscard extends Struct.ComponentSchema {
  collectionName: 'components_shared_insightscards';
  info: {
    description: '';
    displayName: 'Insightscard';
  };
  attributes: {
    Category: Schema.Attribute.String;
    Description: Schema.Attribute.Text;
    Image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    Title: Schema.Attribute.String;
  };
}

export interface SharedLanguagePicker extends Struct.ComponentSchema {
  collectionName: 'components_shared_language_pickers';
  info: {
    displayName: 'Language Picker';
  };
  attributes: {
    languages: Schema.Attribute.Enumeration<['de-DE', 'en-US']> &
      Schema.Attribute.DefaultTo<'de-DE'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedMenu extends Struct.ComponentSchema {
  collectionName: 'components_shared_menus';
  info: {
    displayName: 'menu';
  };
  attributes: {
    menu_item: Schema.Attribute.Component<'shared.menu-item', true>;
  };
}

export interface SharedMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_menu_items';
  info: {
    displayName: 'menu_item';
  };
  attributes: {
    menu_item_link: Schema.Attribute.String;
    menu_item_title: Schema.Attribute.String;
  };
}

export interface SharedModule extends Struct.ComponentSchema {
  collectionName: 'components_shared_modules';
  info: {
    displayName: 'module';
    icon: 'apps';
  };
  attributes: {
    modul: Schema.Attribute.Component<'shared.text-image-section', true>;
  };
}

export interface SharedPricing extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricings';
  info: {
    displayName: 'pricing';
  };
  attributes: {
    pricing_block: Schema.Attribute.Component<'shared.pricing-block', true>;
  };
}

export interface SharedPricingBlock extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricing_blocks';
  info: {
    displayName: 'pricing_block';
  };
  attributes: {
    pricing_plan_features: Schema.Attribute.Blocks;
    pricing_plan_name: Schema.Attribute.String;
    pricing_plan_price: Schema.Attribute.String;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    CTA: Schema.Attribute.Component<'shared.cta', true>;
    system_name: Schema.Attribute.Text;
  };
}

export interface SharedSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_sections';
  info: {
    description: '';
    displayName: 'Section';
  };
  attributes: {
    background_style: Schema.Attribute.String;
    Product: Schema.Attribute.Component<'shared.text-image-section', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'rec. 150 char.'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'rec. 60 char.'>;
    pillar_id: Schema.Attribute.String;
    seo_keyword: Schema.Attribute.String;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_shared_testimonials';
  info: {
    description: '';
    displayName: 'testimonials';
  };
  attributes: {
    testimonial: Schema.Attribute.Component<'shared.quote', true>;
  };
}

export interface SharedTextImageSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_image_sections';
  info: {
    description: '';
    displayName: 'Product';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
    content_md: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right', 'stacked']>;
    primary_cta: Schema.Attribute.Component<'shared.cta-button', true>;
    secondary_cta: Schema.Attribute.Component<'shared.cta-button', false>;
    step_number: Schema.Attribute.Integer;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedUsc extends Struct.ComponentSchema {
  collectionName: 'components_shared_uscs';
  info: {
    description: '';
    displayName: 'usc';
  };
  attributes: {
    use_case_category_name: Schema.Attribute.String;
    use_case_container: Schema.Attribute.Component<'shared.holder-1', true>;
  };
}

export interface SharedUseCase extends Struct.ComponentSchema {
  collectionName: 'components_shared_use_cases';
  info: {
    description: '';
    displayName: 'use_case';
  };
  attributes: {
    use_case_category: Schema.Attribute.Component<'shared.usc', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.agent-cta': SharedAgentCta;
      'shared.authors-note': SharedAuthorsNote;
      'shared.cta': SharedCta;
      'shared.cta-button': SharedCtaButton;
      'shared.faq': SharedFaq;
      'shared.features': SharedFeatures;
      'shared.flourish-link': SharedFlourishLink;
      'shared.hero-section': SharedHeroSection;
      'shared.holder': SharedHolder;
      'shared.holder-1': SharedHolder1;
      'shared.how-it-works': SharedHowItWorks;
      'shared.info-card': SharedInfoCard;
      'shared.info-section': SharedInfoSection;
      'shared.insights': SharedInsights;
      'shared.insightscard': SharedInsightscard;
      'shared.language-picker': SharedLanguagePicker;
      'shared.media': SharedMedia;
      'shared.menu': SharedMenu;
      'shared.menu-item': SharedMenuItem;
      'shared.module': SharedModule;
      'shared.pricing': SharedPricing;
      'shared.pricing-block': SharedPricingBlock;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.section': SharedSection;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.testimonials': SharedTestimonials;
      'shared.text-image-section': SharedTextImageSection;
      'shared.usc': SharedUsc;
      'shared.use-case': SharedUseCase;
    }
  }
}
