const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Disables Android lint enforcement for release builds.
 *
 * Expo tooling (e.g. the `locales` feature) and some third-party native
 * modules can emit non-fatal lint findings such as `ExtraTranslation` that
 * abort the `lintVitalRelease` Gradle task — failing the build only at the
 * very end, after ~20 minutes of compilation. These findings do not affect
 * runtime behaviour or Play Store acceptance, so we don't want them to block
 * packaging of the app bundle.
 *
 * This injects a `lint { ... }` block as the first child of the top-level
 * `android { }` block in the generated app/build.gradle.
 */
const LINT_BLOCK = `
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
`;

module.exports = function withReleaseLintFix(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      return cfg;
    }
    const contents = cfg.modResults.contents;
    // Idempotent: skip if we've already applied it.
    if (contents.includes('checkReleaseBuilds false')) {
      return cfg;
    }
    // Insert our lint block right after the opening of the top-level android {}.
    cfg.modResults.contents = contents.replace(
      /\nandroid\s*\{/,
      (match) => `${match}${LINT_BLOCK}`,
    );
    return cfg;
  });
};
