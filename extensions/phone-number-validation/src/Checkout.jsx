import React from "react";
import {
  reactExtension,
  useApi,
  useShippingAddress,
  useApplyShippingAddressChange,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import { logErrorToApp } from "../../HelperError/ErrorLog.jsx"


export default reactExtension("purchase.checkout.block.render", () => (
  <CombinedExtension />
));

function CombinedExtension() {
  try {
    const { ui: _ui } = useApi();
    const { countryCode, phone } = useShippingAddress();
    const applyShippingAddressChange = useApplyShippingAddressChange();

    const basePrefix = "+923";
    let phoneNo = phone?.trim() || "";

    // ✅ Apply change only if needed (to prevent loop)
    if (!phoneNo.startsWith(basePrefix) && countryCode === "PK") {
      phoneNo = basePrefix + phoneNo.replace(/^\+?03/, "");
      applyShippingAddressChange({
        type: "updateShippingAddress",
        address: { phone: phoneNo },
      });
    }

    let formattedPhone = phoneNo
      .replace(/^03/, "")
      .replace(/^3/, "")
      .replace(/^021/, "")
      .replace(/[^+\d]/g, "");

    const isValidMobile = /^\+923\d{9}$/.test(formattedPhone);

    useBuyerJourneyIntercept(({ canBlockProgress }) => {
      if (!isValidMobile && countryCode === "PK") {
        return {
          behavior: "block",
          reason: "Enter a valid phone number",
          errors: [
            {
              message:
                "Enter a valid phone number. i.e number format +923XXXXXXXXX",
              target: "$.cart.deliveryGroups[0].deliveryAddress.phone",
            },
          ],
        };
      } else {
        return { behavior: "allow" };
      }
    });
  } catch (error) {
    console.error("Caught in CombinedExtension:", error);

    try {
      logErrorToApp(error, "ERROR", {
        fileName: "phone-number-validation/Checkout.jsx",
        functionName: "CombinedExtension",
      });
    } catch (logError) {
      console.error("Error calling logErrorToApp:", logError);
    }
  }

  return null;
}

