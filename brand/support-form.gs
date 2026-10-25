/**
 * Rebuilds the "Hale & Okafor theme support" Google Form: title, description, questions matched to
 * the theme's features and docs, answer checks, and the confirmation message.
 *
 * How to run it (about two minutes):
 *   1. Open the form in edit mode. Its address looks like
 *      https://docs.google.com/forms/d/FORM_ID/edit — copy FORM_ID into the line below.
 *   2. In the form, ⋮ (top right) → Apps Script. Delete what's there, paste this whole file, Save.
 *   3. Choose the function "rebuildSupportForm" and press Run. Allow access when Google asks
 *      (it only edits this form).
 *
 * It replaces the form's questions. Existing responses stay in the Responses tab and the linked sheet,
 * but answers to removed questions are no longer shown as columns for new responses.
 */
const FORM_ID = '1CcfgvQ3RmDlTsSPjdxm7ow05avSyJ7-dh1Oh92fwWUg';

const DOCS = 'https://r-jee.github.io/Hale-Okafor-Docs/';

function rebuildSupportForm() {
  const form = FormApp.openById(FORM_ID);

  form
    .setTitle('Hale & Okafor theme support')
    .setDescription(
      'Questions about the Hale & Okafor Shopify theme, answered by the people who made it. ' +
        'Replies come by email within two business days.\n\n' +
        'Most answers are already in the documentation: ' +
        DOCS +
        ' (setup, product records, every section and setting, the sale room, languages, FAQ).',
    )
    .setCollectEmail(true)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setProgressBar(false)
    .setConfirmationMessage(
      'Thank you, your question is on record. We reply by email within two business days.\n\n' +
        'While you wait, the docs may already have the answer: ' +
        DOCS,
    );

  // Start from an empty form.
  form.getItems().forEach((item) => form.deleteItem(item));

  // About you and your store ---------------------------------------------------------------
  form.addSectionHeaderItem().setTitle('Your store');

  form.addTextItem().setTitle('Your name').setRequired(true);

  form
    .addTextItem()
    .setTitle('Store address')
    .setHelpText('Your your-store.myshopify.com address (or your shop’s own domain).')
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .requireTextMatchesPattern('^(https?://)?[A-Za-z0-9.-]+\\.[A-Za-z]{2,}(/.*)?$')
        .setHelpText('Enter a store address, for example your-store.myshopify.com')
        .build(),
    );

  form
    .addTextItem()
    .setTitle('Theme version')
    .setHelpText('Online Store → Themes → ⋯ → View theme info. For example 1.0.0.');

  form
    .addMultipleChoiceItem()
    .setTitle('Has the theme’s code been changed?')
    .setHelpText('Support covers the theme as released; code changes made by you or a developer are outside it.')
    .setChoiceValues(['No, only settings in the theme editor', 'Yes, small changes', 'Yes, a developer changed it', 'Not sure'])
    .setRequired(true);

  // Your question -------------------------------------------------------------------------
  form.addSectionHeaderItem().setTitle('Your question');

  form
    .addListItem()
    .setTitle('Topic')
    .setChoiceValues([
      'Getting started and setup',
      'Product records (object numbers, measurements, metafields)',
      'Collections, filters and the archive',
      'Sections, blocks and templates',
      'Sale room, commissions, holds and offers',
      'Films (video sections)',
      'Languages and right-to-left',
      'Markets, currencies and checkout',
      'Speed or accessibility',
      'Something isn’t working (bug report)',
      'Something else',
    ])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Page where it happens')
    .setHelpText('A link to the page, product or collection, if it helps.')
    .setValidation(FormApp.createTextValidation().requireTextIsUrl().setHelpText('Paste a full link, starting with https://').build());

  form
    .addCheckboxItem()
    .setTitle('Where do you see it?')
    .setChoiceValues(['Desktop', 'Phone', 'Tablet', 'Theme editor'])
    .showOtherOption(true);

  form
    .addParagraphTextItem()
    .setTitle('Your question')
    .setHelpText('What you wanted to do, what happened instead, and the steps to see it. The section or setting name helps.')
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Screenshot or screen recording (link)')
    .setHelpText('Optional. Share it from Google Drive, Dropbox or similar and paste the link.')
    .setValidation(FormApp.createTextValidation().requireTextIsUrl().setHelpText('Paste a full link, starting with https://').build());

  form
    .addCheckboxItem()
    .setTitle('Before you send')
    .setChoiceValues(['I’ve looked for the answer in the docs and FAQ'])
    .setRequired(true);

  Logger.log('Done. Preview: ' + form.getPublishedUrl());
}
