#!/usr/bin/env node
const commander = require('commander');
const Path = require('path');
const fs = require('fs');
const moment = require('moment');
const { transports } = require('winston');

const logger = require('./lib/logger');
const MergeLocalizationLabels = require('./index');

const appVersion = require('./package.json').version;

/**
 * Create the specified folder path
 *
 * @param {*} fullPath
 */
const makeFolder = (fullPath) => {
  const path = fullPath.replace(/\/$/, '').split('/');
  for (let i = 1; i <= path.length; i += 1) {
    const segment = path.slice(0, i).join('/');
    if (!fs.existsSync(segment)) {
      fs.mkdirSync(segment);
    }
  }
};

/**
 * This process the labels files and merges them
 *
 * @param {*} options The command line options
 */
const mergeLabels = async (options) => {
  const loggingOptions = {
    label: 'merge-localization-labels:mergeLabels',
  };

  const MergeLocalizationLabelsOptions = {
    lhs: options.target,
    rhs: options.source,
    logger,
  };

  // Split the output file and create folder if necessary
  makeFolder(Path.dirname(options.output));

  logger.debug(`Preparing to Merge Labels`, loggingOptions);
  const merger = new MergeLocalizationLabels(MergeLocalizationLabelsOptions);
  await merger.writeMergedProperties(options.output).then((data) => {
    logger.info(`Labels Merged. Results: ${JSON.stringify(data)}`, loggingOptions);
  });
  logger.info(`Labels Merged`, loggingOptions);
};

/**
 * Process the command line and then run the merge
 *
 */
const main = () => {
  const loggingOptions = {
    label: 'merge-localization-labels:main',
  };

  const program = new commander.Command();

  const stringTrim = (value) => {
    // parseInt takes a string and an optional radix
    return value.trim();
  };

  program.on('option:verbose', () => {
    logger.level = 'debug';
  });

  program.on('option:logtofile', () => {
    const logfilename = `${moment().utc().format('YYYYMMDD_HHmmss')}_merge_localization_labels.log`;

    // Add logging to a file
    logger.add(
      new transports.File({
        filename: Path.join('logs', logfilename),
        options: {
          flags: 'w',
        },
      })
    );
  });

  program
    .storeOptionsAsProperties(false)
    .name('merge-localization-labels')
    .version(appVersion)
    .requiredOption('-s, --source <file>', 'The source locale label file', stringTrim)
    .requiredOption('-t, --target <file>', 'The target locale label file', stringTrim)
    .requiredOption('-o, --output <file>', 'The output file', stringTrim)
    .option('-v, --verbose', 'Set the verbosity of the logging to debug')
    .option('-l, --logtofile', 'Log to a file in logs folder');

  program.parse(process.argv);

  logger.info('Process Started', loggingOptions);

  const options = program.opts();
  logger.debug(`Command Line Options: ${JSON.stringify(options)}`, loggingOptions);

  options.logger = logger;

  try {
    mergeLabels(options);
  } catch (error) {
    logger.error(`${error}`, loggingOptions);
  }

  logger.info('Process Completed', loggingOptions);
};

main();
