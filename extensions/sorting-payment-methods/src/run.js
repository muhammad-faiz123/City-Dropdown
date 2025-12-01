// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").RenameOperation} RenameOperation
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const configuration = JSON.parse(
    input?.paymentCustomization?.metafield?.value ?? "{}"
  );
  const paymentMethodsToEdit = configuration.paymentMethodsToEdit;

  // const paymentMethodNameCOD = "Bank Deposit";
  // const paymentMethodNameBankDeposit = "Money Order";
  // const paymentMethodNameMoneyOrder = "Cash on Delivery (COD)";
  // const paymentMethodNameMoneyOrder1 = "MeezanBank";

  // const paymentMethodsWithIndex = input.paymentMethods.map((method, index) => ({
  //   ...method,
  //   originalIndex: index,
  // }));

  // const sortedPaymentMethods = paymentMethodsWithIndex.sort(
  //   (a, b) => a.originalIndex - b.originalIndex
  // );

  // const operations = [];

  // const paymentMethodToRenameCOD = sortedPaymentMethods.find((method) =>
  //   method.name.toLowerCase().includes(paymentMethodNameCOD.toLowerCase())
  // );

  // if (paymentMethodToRenameCOD) {
  //   operations.push({
  //     move: {
  //       paymentMethodId: paymentMethodToRenameCOD.id,
  //       index: 0,
  //     },
  //   });
  // }

  // const paymentMethodToRenameBankDeposit = sortedPaymentMethods.find((method) =>
  //   method.name
  //     .toLowerCase()
  //     .includes(paymentMethodNameBankDeposit.toLowerCase())
  // );

  // if (paymentMethodToRenameBankDeposit) {
  //   operations.push({
  //     move: {
  //       paymentMethodId: paymentMethodToRenameBankDeposit.id,
  //       index: 1,
  //     },
  //   });
  // }

  // const paymentMethodToRenameMoneyOrder = sortedPaymentMethods.find((method) =>
  //   method.name
  //     .toLowerCase()
  //     .includes(paymentMethodNameMoneyOrder.toLowerCase())
  // );

  // if (paymentMethodToRenameMoneyOrder) {
  //   operations.push({
  //     move: {
  //       paymentMethodId: paymentMethodToRenameMoneyOrder.id,
  //       index: 2,
  //     },
  //   });
  // }

  // const paymentMethodToRenameMoneyOrder1 = sortedPaymentMethods.find((method) =>
  //   method.name
  //     .toLowerCase()
  //     .includes(paymentMethodNameMoneyOrder1.toLowerCase())
  // );

  // if (paymentMethodToRenameMoneyOrder1) {
  //   operations.push({
  //     move: {
  //       paymentMethodId: paymentMethodToRenameMoneyOrder1.id,
  //       index: 3,
  //     },
  //   });
  // }
  const operations = [];

  for (let i = 0; i < paymentMethodsToEdit.length; i++) {
    const paymentMethod = input.paymentMethods.find((method) =>
      method.name.includes(paymentMethodsToEdit[i].original)
    );

    if (paymentMethod) {
      operations.push({
        move: {
          paymentMethodId: paymentMethod.id,
          index: paymentMethodsToEdit[i].sortId,
        },
      });
    }
  }

  return operations.length > 0 ? { operations } : NO_CHANGES;
}
