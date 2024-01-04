import fs from 'fs/promises';

const contractName = process.argv[2];
const abiPath = `./artifacts/contracts/${contractName}.sol/${contractName}.json`;

const readFile = async (path) => {
  try {
    const data = await fs.readFile(path, 'utf8');
    const json = JSON.parse(data);
    return json.abi;
  } catch (err) {
    throw new Error(err);
  }
};

const typeDistribution = (type) => {
  if (type.includes('int')) return 'number';
  if (type === 'string' || type === 'address') return 'string';
  // if (type === 'address') return 'string';
  if (type === 'bool') return 'boolean';
}

const parameterSpaceControl = (paramters, name, type) => {
  if (paramters.length > 1) return `    ${name}: ${typeDistribution(type)}`;
  else if (paramters.length === 1) return `${name}: ${typeDistribution(type)}`;
  else return;
}

const functionLine = (functionName, parametersWithType) => {
  let joinParams = `(${parametersWithType}) => any`;
  if (parametersWithType.length > 1) joinParams = `(\n${parametersWithType.join(', \n')}\n  ) => any;`;
  return `  ${functionName}: ${joinParams}`;
}

const appendFile = async (word) => {
  await fs.appendFile('type.ts', `${word}\n`, (err) => {
    if (err) throw err;
  });
}

(async () => {
  const abi = await readFile(abiPath);
  const filteredAbi = abi.map((data) => ({
    function: data.name,
    parameters: data.inputs.map((parameter) => ({
      name: parameter.name,
      type: parameter.type
    }))
  }));

  await appendFile('export type ContractType = {');
  await filteredAbi.forEach(async ({ function: functionName, parameters }, index) => {
    let pr = [];
    parameters.forEach(({ name, type }) => {
      const params = parameterSpaceControl(parameters, name, type);
      pr.push(params)
    })
  
    const joinFunctionLine = functionLine(functionName, pr);
    await appendFile(joinFunctionLine)
  });
  await appendFile('};');
})();



