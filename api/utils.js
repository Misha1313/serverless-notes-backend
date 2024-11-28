export function getResponseHeaders() {
  return {
    'Access-Control-Allow-Origin': '*'
  }
}

export function getUserId(headers) {
  return headers.app_user_id;
}

export function getUserName(headers) {
  return headers.app_user_name;
}