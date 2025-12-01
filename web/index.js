// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());
app.use("/myApp/*", authentication);

async function authentication(req, res, next) {
  let shop = req.query.shop;
  if (!shop) {
    return res.status(400).json({ message: "Shop parameter is required" });
  }
  let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
  const stg = await shopify.api.session.customAppSession(shop);
  console.log("abc->>>>>>", shop, stg.shop);
  if (shop === stg.shop) {
    next();
  } else {
    res.send("send not authorized");
  }
}
app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/paymentMethods", async (_req, res) => {
  try {
    // Fetch the payment gateways using the REST API
    const response = await shopify.api.rest.Payment.all({
      session: res.locals.shopify.session,
    });
    // Log the response for debugging
    console.log("Payment Gateways:", response);

    // Send the available payment gateways in the response
    res.status(200).json({ paymentGateways: response });
    return;
    // const response = await shopify.api.rest.PaymentGateway.all({
    //   session: res.locals.shopify.session,
    // });
    //   const client = new shopify.api.clients.Graphql({
    //     session: res.locals.shopify.session,
    //   });
    //   const response = await client.query({
    //     data: `query checkout {
    //     id
    //     paymentMethods {
    //       id
    //       name
    //       type
    //     }
    //   }
    // `,
    //   });

    // const paymentGateways = await response.body.data.shop.paymentSettings
    //   .availablePaymentGateways;
    console.log("paymentGateways", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error fetching payment methods1:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

app.get("/api/shopifyFunctions", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    const response = await client.query({
      data: `query {
    shopifyFunctions(first: 25) {
      nodes {
        app {
          title
        }
        apiType
        title
        id
      }
    }
  }`,
    });

    // const paymentGateways = await response.body.data.shop.paymentSettings
    //   .availablePaymentGateways;
    // const sendToClient = await response.data.json();
    console.log("shopify functions", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error fetching payment methods1:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

app.get("/api/paymentCustomizationId", async (_req, res) => {
  try {
    // let { isSorted } = _req.query;
    // console.log("checkss", isSorted);
    // if (!isSorted) {
    //   isSorted = false;
    // }
    // let search = isSorted ? "sortingPaymentMethods" : "payment-customization";
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    const response = await client.query({
      data: `{
    paymentCustomizations(first: 10) {
      edges {
        node {
          id
          title
          enabled
          functionId
          metafields(first: 5) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
      }
    }
  }
  `,
    });

    const filterMethodsIds =
      response.body.data.paymentCustomizations.edges.filter((edge) => {
        return (
          edge.node.title === "sortingPaymentMethods" ||
          edge.node.title === "payment-customization"
        );
      });
    const index = filterMethodsIds.length - 1;
    console.log("paymentCustomizationId", filterMethodsIds);
    res.status(200).json({ response: filterMethodsIds });
  } catch (error) {
    console.error("Error fetching payment methods1:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

app.get("/api/paymentMethodsName", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    const response = await client.query({
      data: `{
    translatableResources(first: 20, resourceType: PAYMENT_GATEWAY) {
      nodes {
        translatableContent {
          key
          value
        }
      }
    }
  }`,
      tries: 2,
    });

    // const filterMethodsIds =
    //   response.body.data.paymentCustomizations.edges.filter((edge) => {
    //     return edge.node.title === "payment-customization";
    //   });
    // const index = filterMethodsIds.length - 1;

    const filtered = response.body.data.translatableResources.nodes.map(
      (node) => {
        return {
          ...node,
          translatableContent: node.translatableContent.filter(
            (item) => item.value !== ""
          ),
        };
      }
    );

    res.status(200).json({ response: filtered });
  } catch (error) {
    console.error("Error fetching payment :", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

app.get("/api/getMetaObjectCities", async (_req, res) => {
  try {
    //payment_method_names-1
    const { id, key } = _req.query;
    console.log("check", id, key);
    if (!id) {
      return res.status(400).json({ message: "Method name is required" });
    }
    console.log("id check", id, key);
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    //testing_zeen_checkout_city
    const response = await client.query({
      data: `query {
  metaobjects(type: "${id}", first: 10) {
    nodes {
    id
      handle
      type
      title: field(key: "${key}") { value }
    }
  }
}`,
      tries: 2,
    });

    // const paymentGateways = await response.body.data.shop.paymentSettings
    //   .availablePaymentGateways;
    // const sendToClient = await response.data.json();
    // @ts-ignore
    console.log("getMetaObject result", response.body.data);
    // @ts-ignore
    res.status(200).json({ response: response.body.data });
  } catch (error) {
    console.error("getMetaObject Error:", error);
    res.status(500).json({ message: "getMetaObject Error", error });
  }
});

app.get("/api/getMetaObject", async (_req, res) => {
  try {
    //payment_method_names-1
    const { type } = _req.query;
    console.log("check meta payment", type);
    // if (!id) {
    //   return res.status(400).json({ message: "Method name is required" });
    // }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: `query {
  metaobjects(type: "${type}", first: 100) {
    nodes {
    id
      handle
      type
      original_name: field(key: "original_name") { value }
      rename_value: field(key: "rename_value") { value }
      sortid: field(key: "sortid") { value }
      isAdditionalMethod: field(key: "isAdditionalMethod") { value }
    }
  }
}`,
    });

    // const paymentGateways = await response.body.data.shop.paymentSettings
    //   .availablePaymentGateways;
    // const sendToClient = await response.data.json();
    console.log("getMetaObject result", response.body.data);
    res.status(200).json({ response: response.body.data });
  } catch (error) {
    console.error("getMetaObject Error:", error);
    res.status(500).json({ message: "getMetaObject Error", error });
  }
});

app.post("/api/customizePaymentMethod", async (_req, res) => {
  const { functionId, functionName } = _req.body; // Extract functionId from request body

  if (!functionId) {
    return res.status(400).json({ error: "functionId is required" });
  }
  if (!functionName) {
    return res.status(400).json({ error: "functionName is required" });
  }

  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    // Define the mutation with dynamic functionId
    const response = await client.query({
      data: `mutation {
          paymentCustomizationCreate(paymentCustomization: {
            title: "${functionName}",
            enabled: true,
            functionId: "${functionId}"
          }) {
            paymentCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }`,
    });

    console.log(
      "payment customization response:",
      response.body.data.paymentCustomizationCreate
    );
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error creating payment customization:", error);
    res.status(500).json({ error: "Failed to create payment customization" });
  }
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/api/createMetaObjectDefinition", async (req, res) => {
  try {
    const { type_two, type, key, name, rename, dataType, isAdditionalMethod } =
      req.body;
    // console.log("orignal_name", orignal_name);
    // if (!orignal_name || !customized_name) {
    //   return res
    //     .status(400)
    //     .json({ error: "orignal_name and customized_name are required" });
    // }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `mutation {
    metaobjectDefinitionCreate(definition: {
      type: "${type}",
      access: {
        storefront: PUBLIC_READ
      },
      capabilities: {
        publishable: {
          enabled: true
        }
      },
      fieldDefinitions: [
        { key: "${key}", name: "${name}", type: "${dataType}" }
        { key: "${rename}", name: "${rename}", type: "${dataType}" }
        { key: "${type_two}", name: "${type_two}", type: "${dataType}" }
        { key: "${isAdditionalMethod}", name: "${isAdditionalMethod}", type: "${dataType}" }
      ]
    }) {
      metaobjectDefinition {
        id
        type
        fieldDefinitions {
          key
          name
          type {
            name
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
  `,
        variables: {
          definition: {
            type,
            // handle: "city_c",
            name,
            key,
          },
        },
      },
    });

    console.log(
      "definitionmetaobject:",
      response.body.data.metaobjectDefinitionCreate
    );
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});

app.post("/api/createMetaObjectDefinitionCities", async (req, res) => {
  try {
    const { type, key, name, dataType } = req.body;
    // console.log("orignal_name", orignal_name);
    // if (!orignal_name || !customized_name) {
    //   return res
    //     .status(400)
    //     .json({ error: "orignal_name and customized_name are required" });
    // }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `mutation {
  metaobjectDefinitionCreate(definition: {
    type: "${type}",
    access: {
      storefront: PUBLIC_READ
    },
    capabilities: {
      publishable: {
        enabled: true
      }
    },
    fieldDefinitions: [
      { key: "${key}", name: "${name}", type: "${dataType}" }
    ]
  }) {
    metaobjectDefinition {
      id
      type
      fieldDefinitions {
        key
        name
        type {
          name
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`,
        variables: {
          definition: {
            type,
            // handle: "city_c",
            name,
            key,
          },
        },
      },
    });

    console.log("definitionmetaobject:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});

app.post("/api/rename_payment_method", async (req, res) => {
  try {
    const { functionId, paymentMethodId, paymentMethodsToEdit } = req.body;
    console.log("payload recieved at server side", req.body);
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    const paymentCustomizationInput = {
      functionId,
      title: `payment-customization`,
      enabled: true,
      metafields: [
        {
          namespace: "payment-customization",
          key: "function-configuration",
          type: "json",
          value: JSON.stringify({
            // paymentMethodName: newName,
            // originalName: selected,

            paymentMethodsToEdit,
          }),
        },
      ],
    };
    const response = await client.query({
      data: {
        query: `mutation updatePaymentCustomization($id: ID!, $input: PaymentCustomizationInput!) {
            paymentCustomizationUpdate(id: $id, paymentCustomization: $input) {
              paymentCustomization {
                id
              }
              userErrors {
                message
              }
            }
          }`,
        variables: {
          id: `gid://shopify/PaymentCustomization/${paymentMethodId}`,
          input: paymentCustomizationInput,
        },
      },
    });

    console.log("timtim:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});
app.post("/api/sort_payment_method", async (req, res) => {
  try {
    const { functionId, paymentMethodId, paymentMethodsToEdit } = req.body;
    console.log("payload recieved at server side", req.body);
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    const paymentCustomizationInput = {
      functionId,
      title: `sortingPaymentMethods`,
      enabled: true,
      metafields: [
        {
          namespace: "payment-customization",
          key: "function-configuration-sort",
          type: "json",
          value: JSON.stringify({
            // paymentMethodName: newName,
            // originalName: selected,

            paymentMethodsToEdit,
          }),
        },
      ],
    };
    const response = await client.query({
      data: {
        query: `mutation updatePaymentCustomization($id: ID!, $input: PaymentCustomizationInput!) {
            paymentCustomizationUpdate(id: $id, paymentCustomization: $input) {
              paymentCustomization {
                id
              }
              userErrors {
                message
              }
            }
          }`,
        variables: {
          id: `gid://shopify/PaymentCustomization/${paymentMethodId}`,
          input: paymentCustomizationInput,
        },
      },
    });

    console.log("timtim:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});

app.post("/api/addMetaObject", async (req, res) => {
  try {
    const { orignal_name, customized_name, type, sortId, isAdditionalMethod } =
      req.body;
    console.log("create metaobject ", req.body);
    if (!orignal_name || !customized_name) {
      return res
        .status(400)
        .json({ error: "orignal_name and customized_name are required" });
    }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        id
        handle
        season: field(key: "original_name") {
          value
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }`,
        variables: {
          metaobject: {
            type: `${type}`,
            handle: orignal_name.replace(/[^a-zA-Z]/g, ""),
            fields: [
              {
                key: "original_name",
                value: orignal_name,
              },
              {
                key: "rename_value",
                value: customized_name,
              },
              {
                key: "sortid",
                value: `${sortId}`,
              },
              {
                key: "isAdditionalMethod",
                value: `${isAdditionalMethod}`,
              },
            ],
          },
        },
      },
    });

    console.log("addmetaobject:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});

app.post("/api/updateMetaObject", async (req, res) => {
  try {
    const { sortId, customized_name, id } = req.body;
    console.log("checking", customized_name, id);
    if (!id || !customized_name) {
      return res
        .status(400)
        .json({ error: "id and customized_name are required" });
    }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject {
        handle
        season: field(key: "original_name") {
          value
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }`,
        variables: {
          id: `gid://shopify/Metaobject/${id}`,
          metaobject: {
            fields: [
              {
                key: "rename_value",
                value: customized_name,
              },
              {
                key: "sortid",
                value: `${sortId}`,
              },
            ],
          },
        },
      },
    });

    console.log("addmetaobject:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});

app.post("/api/updateMetaObjectCities", async (_req, res) => {
  try {
    const { customized_name, id, key } = _req.body;
    console.log("checking", customized_name, id);
    if (!id || !customized_name) {
      return res
        .status(400)
        .json({ error: "id and customized_name are required" });
    }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
  metaobjectUpdate(id: $id, metaobject: $metaobject) {
    metaobject {
      handle
      season: field(key: "${key}") {
        value
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}`,
        variables: {
          id: `gid://shopify/Metaobject/${id}`,
          metaobject: {
            fields: [
              {
                key,
                value: customized_name,
              },
            ],
          },
        },
      },
    });

    console.log("updatemetaobject:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});

app.post("/api/addMetaObjectCities", async (req, res) => {
  try {
    const { type, key, value } = req.body;
    // let val = value.toString();
    // console.log("dddddddddddddddd", val);
    // console.log("orignal_name", orignal_name);
    // if (!orignal_name || !customized_name) {
    //   return res
    //     .status(400)
    //     .json({ error: "orignal_name and customized_name are required" });
    // }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `
          mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
            metaobjectCreate(metaobject: $metaobject) {
              metaobject {
                capabilities {
                  publishable {
                    status
                  }
                }
                id
                type
                title: field(key: "cities") {
                  value
                }
              }
                  userErrors {
      field
      message
    }
            }
          }
        `,
        variables: {
          metaobject: {
            type, // Yahan dynamic type use karein agar zaroori ho
            fields: [
              {
                key, // Key agar dynamic ho toh usko bhi variable se pass karein
                value, // Yeh value dynamic hogi jo aap variable se pass karenge
              },
            ],
            capabilities: {
              publishable: { status: "ACTIVE" }, // Yeh bhi structure maintain karega
            },
          },
        },
      },
    });

    console.log("addmetaobject:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error editing:", error);
    res.status(500).json({ error: "Failed to rename payment method" });
  }
});
app.delete("/api/deleteMetaObject", async (req, res) => {
  try {
    const { id } = req.query;
    // let val = value.toString();
    // console.log("dddddddddddddddd", val);
    // console.log("orignal_name", orignal_name);
    // if (!orignal_name || !customized_name) {
    //   return res
    //     .status(400)
    //     .json({ error: "orignal_name and customized_name are required" });
    // }

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: `mutation DeleteMetaobject($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
        userErrors {
          field
          message
          code
        }
      }
    }`,
        variables: {
          id: `gid://shopify/Metaobject/${id}`,
        },
      },
    });

    console.log("deletemetaobject:", response);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error deleting metaobject:", error);
    res.status(500).json({ error: "Error deleting metaobject" });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
