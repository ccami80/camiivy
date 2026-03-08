import api from '@/utils/apis';
import { getBackendUri, auth, admin, partner, user } from '@/utils/apiPaths';

export async function adminLogin(email, password) {
  return api.post({
    uri: getBackendUri(),
    path: auth.adminLogin,
    data: { email, password },
  });
}

export async function partnerLogin(email, password) {
  return api.post({
    uri: getBackendUri(),
    path: auth.partnerLogin,
    data: { email, password },
  });
}

export async function userLogin(email, password) {
  return api.post({
    uri: getBackendUri(),
    path: auth.login,
    data: { email, password },
  });
}

export async function signup(payload) {
  return api.post({
    uri: getBackendUri(),
    path: auth.signup,
    data: payload,
  });
}

export async function getAdminMe() {
  return api.get({
    uri: getBackendUri(),
    path: admin.dashboard,
  });
}

export async function getPartnerMe() {
  return api.get({
    uri: getBackendUri(),
    path: partner.me,
  });
}

export async function getUserMe() {
  return api.get({
    uri: getBackendUri(),
    path: user.me,
  });
}
