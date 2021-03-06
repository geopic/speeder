const assert = require('assert');
const speeder = require('../index');
const { COUNTS } = require('../src/globals');

describe('speeder', () => {
  async function testFunctionAsync() {
    return 0;
  }

  function testFunction() {
    return 0;
  }

  function errorFunction() {
    throw new Error('Planned Error');
  }

  describe('no options', () => {
    it('single function returns single object with verbose', async () => {
      await speeder(testFunction, { verbose: true }).then((result) => {
        assert.strictEqual(result.min * 0, 0);
        assert.strictEqual(result.max * 0, 0);
        assert.strictEqual(result.mean * 0, 0);
        assert.strictEqual(result.median * 0, 0);
        assert.strictEqual(result.variance * 0, 0);
        assert.strictEqual(result.std * 0, 0);
        assert.strictEqual(result.counts * 0, 0);
        assert.strictEqual(result.raw, undefined);
      });
    });
    it('multiple functions returns array of results', async () => {
      await speeder([testFunction, testFunction]).then((result) => {
        assert.strictEqual(result.length, 2);
      });
    });
    it('works with sync and async functions', async () => {
      await speeder(testFunctionAsync).then(() => {});
      await speeder(testFunction, { verbose: true }).then((result) => {
        assert.strictEqual(typeof result.min, typeof 0);
        assert.strictEqual(typeof result.min, typeof 0);
      });
    });
    it('creates a default name if names are not given', async () => {
      await speeder(testFunction, { verbose: true }).then((result) => {
        assert.strictEqual(result.name, 'Function 1');
      });
    });
    it('creates a default names if names are not given', async () => {
      await speeder([testFunction, testFunction], { verbose: true }).then(
        (result) => {
          assert.strictEqual(result[0].name, 'Function 1');
          assert.strictEqual(result[1].name, 'Function 2');
        }
      );
    });
  });
  describe('options', () => {
    describe('errors', () => {
      it('works with multiple functions', async () => {
        await speeder([testFunction, testFunctionAsync], {
          verbose: true,
        }).then((result) => {
          assert.strictEqual(result.length, 2);
          assert.strictEqual(typeof result[0].min, typeof 4.4);
          assert.strictEqual(typeof result[0].max, typeof 4.4);
          assert.strictEqual(typeof result[0].mean, typeof 4.4);
          assert.strictEqual(typeof result[0].median, typeof 4.4);
          assert.strictEqual(typeof result[0].variance, typeof 4.4);
          assert.strictEqual(typeof result[0].std, typeof 4.4);
        });
      });
      it('works with single function', async () => {
        await speeder(testFunction, { verbose: true }).then((result) => {
          assert.strictEqual(typeof result.min, typeof 4.4);
          assert.strictEqual(typeof result.max, typeof 4.4);
          assert.strictEqual(typeof result.mean, typeof 4.4);
          assert.strictEqual(typeof result.median, typeof 4.4);
          assert.strictEqual(typeof result.variance, typeof 4.4);
          assert.strictEqual(typeof result.std, typeof 4.4);
        });
      });
      it('expects errors if inputted correctly', async () => {
        await speeder(errorFunction, { errors: true });
      });
      it('throws an error if errors is not boolean or an array', async () => {
        try {
          await speeder([testFunction, testFunction], {
            errors: { some: 'prop' },
          });
          throw new Error('False error');
        } catch (error) {
          if (error.message === 'False error') {
            throw new Error('False error thrown');
          }
        }
      });
      it('throws an error if errors doesnt have the same length as functions', async () => {
        try {
          await speeder([testFunction, testFunction], { errors: [true] });
          throw new Error('False error');
        } catch (error) {
          console.log(error.message);
          if (error.message === 'False error') {
            throw new Error('False error thrown');
          }
        }
      });

      it('expects an error to be thrown after x amount of errors, if errors is off', async () => {
        try {
          await speeder(errorFunction, { errorOutAfter: 10 });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
          // well done
        }
        try {
          await speeder(errorFunction, { errorOutAfter: 10000 });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('does an analysis when we expect an error', async () => {
        await speeder(errorFunction, {
          errors: true,
          verbose: true,
        }).then((result) => assert.strictEqual(typeof result.mean, typeof 8.8));
      });
      it('errors out after a certain amount of errors', async () => {
        try {
          await speeder(errorFunction, { errorOutAfter: 10, counts: 1000 });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('works when multiple functions & errors were inputted', async () => {
        await speeder([testFunction, testFunction], {
          errors: [true, true],
          verbose: true,
        }).then((result) => assert.strictEqual(result[0].counts, COUNTS));
      });
      it('throws error when errors not the same length as functions', async () => {
        try {
          await speeder([testFunction, testFunction], {
            errors: [true, true, true],
          }).then((result) => assert.strictEqual(result[0].counts, COUNTS));
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error.message);
          }
        }
      });
      it('throws error when errorOutAfter does not have correct number of inputs', async () => {
        try {
          await speeder([testFunction, testFunction], {
            errorOutAfter: [1, 1, 1],
          }).then((result) => assert.strictEqual(result[0].counts, COUNTS));
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error.message);
          }
        }
      });
      it('throws error when errorOutAfter contains a wrong input', async () => {
        try {
          await speeder([testFunction, testFunction], {
            errorOutAfter: [1, 1.8],
          }).then((result) => assert.strictEqual(result[0].counts, COUNTS));
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error.message);
          }
        }

        try {
          await speeder([testFunction, testFunction], {
            errorOutAfter: [1, 'false input'],
          }).then((result) => assert.strictEqual(result[0].counts, COUNTS));
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error.message);
          }
        }
      });
      it('basic positive test', async () => {
        await speeder([testFunction, testFunction], {
          errors: [true, true],
        });
      });
    });
    describe('raw', () => {
      it('outputs rawData if set to true', async () => {
        await speeder(testFunction, {
          raw: true,
        }).then((result) => {
          assert.strictEqual(!!result, true);
          assert.strictEqual(result.length, COUNTS);
        });
      });
      it('outputs no rawData if set to false', async () => {
        speeder(testFunction).then((result) => {
          assert.strictEqual(!!result.raw, false);
        });
      });
    });
    describe('names', () => {
      it('single name, for single function', async () => {
        await speeder(testFunction, {
          names: 'inputted name',
          verbose: true,
        }).then((result) => assert.strictEqual(result.name, 'inputted name'));
      });
      it('gives each analysis given names', async () => {
        await speeder([testFunction, testFunctionAsync], {
          names: ['My Function', 'My Second Function'],
          verbose: true,
        }).then((result) => {
          assert.strictEqual(result[0].name, 'My Function');
          assert.strictEqual(result[1].name, 'My Second Function');
        });
      });
      it('throws error if name given is not a String', async () => {
        try {
          await speeder(testFunction, { names: 999 });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
          // well done
        }
      });
      it('default names the analysises if no names given', async () => {
        await speeder(testFunction, { verbose: true }).then((result) => {
          assert.strictEqual(result.name, 'Function 1');
        });
      });
      it('default names the analysises on multiple functions', async () => {
        await speeder([testFunction, testFunction], { verbose: true }).then(
          (result) => {
            assert.strictEqual(result[0].name, 'Function 1');
            assert.strictEqual(result[1].name, 'Function 2');
          }
        );
      });
    });
    describe('inputs / multipleInputs', () => {
      it('works with single input, multipleInputs (boolean input)', async () => {
        try {
          await speeder(testFunction, { inputs: true, multipleInputs: true });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('multipleInputs is true ', async () => {
        try {
          await speeder(testFunction, {
            inputs: true,
            multipleInputs: true,
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('2 functions, 2 inputs', async () => {
        await speeder([testFunction, testFunction], {
          inputs: [true, true],
        });
      });
      it('1 functions, 1 inputs, multipleInputs true', async () => {
        try {
          await speeder(testFunction, {
            inputs: true,
            multipleInputs: true,
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('multipleInputs not boolean, not an array', async () => {
        try {
          await speeder(testFunction, {
            inputs: true,
            multipleInputs: 'This will throw',
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('multipleInputs array, with non-boolean inputs', async () => {
        try {
          await speeder(testFunction, {
            inputs: true,
            multipleInputs: ['This will also throw'],
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('2 functions, 1 input', async () => {
        try {
          await speeder([testFunction, testFunction], {
            inputs: 4,
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
      it('multipleInputs array, incorrect number of inputs', async () => {
        try {
          await speeder([testFunction, testFunction], {
            inputs: [
              [4, 4],
              [4, 4],
            ],
            multipleInputs: [true, true, true, true],
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });

      it('1 input, 1 input', async () => {
        await speeder(testFunction, {
          inputs: 4,
        });
      });
      it('2 functions, 1 mutliple inputs, 1 not', async () => {
        await speeder([testFunction, testFunction], {
          inputs: [4, [5, 5]],
          multipleInputs: [false, true],
        });
      });
      it('throws error with single input, multipleInputs (array input)', async () => {
        try {
          await speeder(testFunction, { inputs: true, multipleInputs: true });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
          // well done
        }
      });
      it('works with multiple inputs, multipleInputs (boolean input)', async () => {
        await speeder([testFunction, testFunction], {
          inputs: [
            [77, 88],
            [77, 88],
          ],
          multipleInputs: true,
        }).then(() => {});
      });
      it('works with multiple inputs, multipleInputs (array input)', async () => {
        await speeder([testFunction, testFunction], {
          inputs: [
            [77, 88],
            [77, 88],
          ],
          multipleInputs: [true, true],
        }).then(() => {});
      });
      it('throws error when false number of inputs and non multipleInputs', async () => {
        try {
          await speeder([testFunction, testFunction], {
            inputs: [
              [77, 88],
              [77, 88],
              [77, 88],
              [77, 88],
              [77, 88],
            ],
            multipleInputs: true,
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
    });
    describe('rounding', () => {
      it('rounds if given single number', async () => {
        const result = await speeder([testFunction, testFunction], {
          round: 4,
        });
        assert.strictEqual(String(result[0].length) < 14, true);
        assert.strictEqual(String(result[1].length) < 14, true);
      });
      it('rounds if given single number, but verbose', async () => {
        const result = await speeder([testFunction, testFunction], {
          round: 4,
          verbose: true,
        });
        assert.strictEqual(String(result[0].min.length) < 14, true);
        assert.strictEqual(String(result[0].max.length) < 14, true);
        assert.strictEqual(String(result[0].mean.length) < 14, true);
        assert.strictEqual(String(result[0].std.length) < 14, true);
        assert.strictEqual(String(result[0].median.length) < 14, true);
        assert.strictEqual(String(result[0].variance.length) < 14, true);

        assert.strictEqual(String(result[1].min.length) < 14, true);
        assert.strictEqual(String(result[1].max.length) < 14, true);
        assert.strictEqual(String(result[1].mean.length) < 14, true);
        assert.strictEqual(String(result[1].std.length) < 14, true);
        assert.strictEqual(String(result[1].median.length) < 14, true);
        assert.strictEqual(String(result[1].variance.length) < 14, true);
      });
      it('rounds if given array for numbers for multiple functions', async () => {
        const result = await speeder([testFunction, testFunction], {
          round: [2, 12],
        });
        assert.strictEqual(
          String(result[0].length).length < String(result[1].length).length,
          true
        );
      });
      it('throws error if not given correct number of round inputs', async () => {
        try {
          await speeder([testFunction, testFunction], {
            round: [3, 6, 4, 1, 2],
          });
          throw new Error('false error');
        } catch (error) {
          if (error.message === 'false error') {
            throw new Error(error);
          }
        }
      });
    });
  });
});
