import arg from 'arg';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createProject } from './main';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'javascript';
  const projectName = 'test-server';
  const email = 'moeedsalfi@gmail.com';
  const name = 'Abdul Moeed Saleem';
  if (options.skipPrompts) {
    return {
      ...options,
      projectName: options.projectName || projectName,
      name: options.name || name,
      email: options.email || email,
      projectName: options.projectName || projectName,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];

  questions.push({
    type: 'input',
    name: 'projectName',
    message: 'Please enter project name:',
  });
  questions.push({
    type: 'input',
    name: 'name',
    message: 'Your Good Name 😀:',
  });
  questions.push({
    type: 'input',
    name: 'email',
    message: 'Your Email 📧:',
    validate: function (email) {
      const valid = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
      if (!valid) {
        console.log(chalk.red.bold('Invalid Email Address'));
        return false
      } else return true;
    }
  });


  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: ['javascript', 'typescript'],
      default: defaultTemplate,
    });
  }

  if (!options.git) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Should a git be initialized?',
      default: false,
    });
  }

  if (!options.runInstall) {
    questions.push({
      type: 'confirm',
      name: 'runInstall',
      message: 'Whould you like us to install packages?',
      default: true,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    projectName: options.projectName || answers.projectName,
    name: options.name || answers.name,
    email: options.email || answers.email,
    template: options.template || answers.template,
    git: options.git || answers.git,
    runInstall: options.runInstall || answers.runInstall,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}

// ...
