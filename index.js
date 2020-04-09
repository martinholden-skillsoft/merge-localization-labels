const PropertiesReader = require('properties-reader');
const fs = require('fs');
const moment = require('moment');
const diff = require('deep-diff');
const _ = require('lodash');

const localLogger = require('./lib/logger');

class MergeLocalizationLabels {
  constructor(options) {
    this._name = 'MergeLocalizationLabels';

    this._comment = options.comment || 'Generated using MergeLocalizationLabels tool';

    const loggingOptions = {
      label: `${this._name}:constructor`,
    };

    this.logger = options.logger || localLogger;
    if (!options.logger) {
      this.logger.level = 'error';
    }

    if (!fs.existsSync(options.lhs)) {
      this.logger.error(`Left Hand Side File Does Not Exist: ${options.lhs}`, loggingOptions);
      throw Error(`Left Hand Side File Does Not Exist: ${options.lhs}`);
    }

    if (!fs.existsSync(options.rhs)) {
      this.logger.error(`Right Hand Side File Does Not Exist: ${options.rhs}`, loggingOptions);
      throw Error(`Right Hand Side File Does Not Exist: ${options.rhs}`);
    }

    this._lhsProperties = PropertiesReader(options.lhs).getAllProperties() || {};
    // Sort the objects
    this._lhsProperties = _(this._lhsProperties).toPairs().sortBy(0).fromPairs().value();

    this.logger.debug(
      `Left Hand Side Properties Loaded: ${JSON.stringify(this._lhsProperties)}`,
      loggingOptions
    );

    this._rhsProperties = PropertiesReader(options.rhs).getAllProperties() || {};

    // Sort the objects
    this._rhsProperties = _(this._rhsProperties).toPairs().sortBy(0).fromPairs().value();

    this.logger.debug(
      `Right Hand Side Properties Loaded: ${JSON.stringify(this._rhsProperties)}`,
      loggingOptions
    );

    this._mergedProperties = undefined;
  }

  getMergedProperties() {
    const loggingOptions = {
      label: `${this._name}:getMergedProperties`,
    };

    this._mergedProperties = this._lhsProperties;

    diff.observableDiff(this._lhsProperties, this._rhsProperties, (difference) => {
      // Apply all changes except where lhs already has a value...
      if (difference.kind !== 'E') {
        this.logger.debug(
          `Applying Difference to lhs: ${JSON.stringify(difference)}`,
          loggingOptions
        );
        diff.applyChange(this._mergedProperties, this._rhsProperties, difference);
      }
    });

    this._mergedProperties = _(this._mergedProperties).toPairs().sortBy(0).fromPairs().value();

    this.logger.debug(
      `Merged Properties: ${JSON.stringify(this._mergedProperties)}`,
      loggingOptions
    );

    return this._mergedProperties;
  }

  async writeMergedProperties(destFile) {
    const loggingOptions = {
      label: `${this._name}:writeMergedProperties`,
    };

    // Convert properties object to string content
    const content = Object.entries(this._mergedProperties || this.getMergedProperties()).map(
      ([k, v]) => `${k}=${v}`
    );

    const comment = `${moment.utc().format('ddd MMM DD HH:mm:ss UTC YYYY')} ${this._comment}`;
    content.unshift(`#${comment}`);

    const results = {
      count: content.length,
      file: destFile,
      comment,
    };

    this.logger.debug(`Writing Merged Properties to : ${destFile}`, loggingOptions);

    return new Promise((resolve, reject) => {
      fs.writeFile(destFile, content.join('\n'), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = MergeLocalizationLabels;
