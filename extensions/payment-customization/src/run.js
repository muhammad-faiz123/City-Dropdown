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
  // const paymentMethodName = configuration.paymentMethodName;
  // const originalName = configuration.originalName;

  const paymentMethodsToEdit = configuration.paymentMethodsToEdit;
  // console.log("paymentMethodName", paymentMethodName);
  // const paymentMethodNameCOD = "Cash on Delivery (COD)";
  // const paymentMethodNameBankDeposit =
  //   "Safepay Checkout - pay with debit & credit cards";
  // const paymentMethodNameMoneyOrder =
  //   "Pay via (Debit/Credit cards/Wallets/Installments)";
  // const paymentMethodNameMoneyOrder1 = "BaadMay | Buy Now. Pay Later";
  // const paymentMethodNameMoneyOrder2 = originalName;

  // const paymentMethodToRenameCOD = input.paymentMethods.find((method) =>
  //   method.name.includes(paymentMethodNameCOD)
  // );

  // const paymentMethodToRenameBankDeposit = input.paymentMethods.find((method) =>
  //   method.name.includes(paymentMethodNameBankDeposit)
  // );

  // const paymentMethodToRenameMoneyOrder = input.paymentMethods.find((method) =>
  //   method.name.includes(paymentMethodNameMoneyOrder)
  // );

  // const paymentMethodToRenameMoneyOrder1 = input.paymentMethods.find((method) =>
  //   method.name.includes(paymentMethodNameMoneyOrder1)
  // );

  // const edited = input.paymentMethods.filter((method) => {
  //   return paymentMethodsToEdit.find((_method) =>
  //     method.name.includes(_method.original)
  //   );
  // });

  // console.log("check edit?", edited);
  // const edited = paymentMethodsToEdit.filter((method)=>{
  //   return input.paymentMethods.find((_method)=>  method.name.includes(_method.original))
  // });
  const operations = [];

  // if (paymentMethodToRenameCOD) {
  //   operations.push({
  //     rename: {
  //       paymentMethodId: paymentMethodToRenameCOD.id,
  //       name: "HBL | Online Card Payment (Debit & Credit)",
  //     },
  //   });
  // }

  // if (paymentMethodToRenameBankDeposit) {
  //   operations.push({
  //     rename: {
  //       paymentMethodId: paymentMethodToRenameBankDeposit.id,
  //       name: "SafePay | Online Card Payment (Debit & Credit)",
  //     },
  //   });
  // }

  // if (paymentMethodToRenameMoneyOrder) {
  //   operations.push({
  //     rename: {
  //       paymentMethodId: paymentMethodToRenameMoneyOrder.id,
  //       name: "Paymob | Debit & Credit card",
  //     },
  //   });
  // }

  // if (paymentMethodToRenameMoneyOrder1) {
  //   operations.push({
  //     rename: {
  //       paymentMethodId: paymentMethodToRenameMoneyOrder1.id,
  //       name: "BaadMay | Pay in Easy Installments",
  //     },
  //   });
  // }

  for (let i = 0; i < paymentMethodsToEdit.length; i++) {
    const paymentMethod = input.paymentMethods.find((method) =>
      method.name.includes(paymentMethodsToEdit[i].original)
    );

    if (paymentMethod) {
      operations.push({
        rename: {
          paymentMethodId: paymentMethod.id,
          name: paymentMethodsToEdit[i].rename,
        },
      });
    }
  }

  console.log("input.cart?.attribute", JSON.stringify(input.cart?.attribute));

  if (
    input.cart?.attribute?.key?.includes("delivery_country") &&
    !input.cart?.attribute?.value?.toLowerCase()?.trim()?.includes("pk")
  ) {
    const paymentMethod = input.paymentMethods.find((method) =>
      method.name.includes("Cash on Delivery (COD)")
    );

    if (paymentMethod) {
      operations.push({
        hide: {
          paymentMethodId: paymentMethod.id,
        },
      });
    }
  }

  // Hide COD for orders above 50,000
  if (input.cart?.cost?.totalAmount?.amount && parseFloat(input.cart.cost.totalAmount.amount) > 50000) {
    const paymentMethod = input.paymentMethods.find((method) =>
      method.name.includes("Cash on Delivery (COD)")
    );

    if (paymentMethod) {
      operations.push({
        hide: {
          paymentMethodId: paymentMethod.id,
        },
      });
    }
  }

  if (input.cart?.lines) {
    for (const line of input.cart.lines) {
      const productId = line.merchandise?.product?.id;
      const productTitle = line.merchandise?.product?.title;

      console.log("🛒 Product:", productTitle, productId);
    }
  }

  // Hide COD if any product has Is Couture = true
  if (input.cart?.lines) {
    for (const line of input.cart.lines) {
      const product = line.merchandise?.product;
      if (!product) continue;
  
      // Use the correct metafield: custom.collection_name
      const collectionName = product.metafield?.value; // this comes from custom.collection_name
      console.log("🛒 Product:", product.title, "Collection Name:", collectionName);
  
      // Check if the metafield value is "Couture"
      if (collectionName === "Couture") {
        const codMethod = input.paymentMethods.find((method) =>
          method.name.includes("Cash on Delivery (COD)")
        );
  
        if (codMethod) {
          operations.push({
            hide: { paymentMethodId: codMethod.id },
          });
        }
        break; // Stop after first matching product
      }
    }
  }
  

  // if (paymentMethodToRenameMoneyOrder2) {
  //   operations.push({
  //     rename: {
  //       paymentMethodId: paymentMethodToRenameMoneyOrder2.id,
  //       name: paymentMethodName,
  //     },
  //   });
  // }

  return operations.length > 0 ? { operations } : NO_CHANGES;
}
