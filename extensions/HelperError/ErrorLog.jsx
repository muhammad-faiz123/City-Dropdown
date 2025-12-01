export const logErrorToApp = async (error = null, logType, { fileName = "", functionName = "" } = {}) => {
  const normalLogURL = "https://applogsbackend.netlify.app/api/apps/log";
  const errorLogURL = "https://applogsbackend.netlify.app/api/apps/error-log";
  const baseURL = logType === "ERROR" ? errorLogURL : normalLogURL;
  const appName = "SS-Checkout";
  const password = "passwordforapplog123";

  // Compose human-readable message
  const context = fileName && functionName ? `(${fileName} => ${functionName})` : "";
  const message = error?.message ? `${error.message} ${context}` : `Unknown error ${context}`;

  const logMessage = {
    message,
    timestamp: new Date().toISOString(),
  };

  console.log("🪵 Sending Log:", logMessage);

  const payload = {
    appName,
    password,
  };

  if (logType === "ERROR") {
    payload.errorLog = JSON.stringify(logMessage, null, 2);
  } else {
    payload.log = JSON.stringify(logMessage, null, 2);
  }

  await fetch(baseURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
