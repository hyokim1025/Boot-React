import { atom } from 'recoil';
import queryClient from '../queryClient';
import { loadMemberCookie, removeMemberCookie, saveMemberCookie } from '../util/cookieUtil';

const signedOut = { member: null, sessionId: null };
const listeners = new Set();
let session;
let nextSessionId = 0;

const memberInfo = (data) => {
  if (!data?.email || !data.accessToken || !data.refreshToken) return null;

  const { email, nickname, social, roleNames, accessToken, refreshToken } = data;
  return { email, nickname, social, roleNames, accessToken, refreshToken };
};

export const getSession = () => {
  if (!session) {
    const member = memberInfo(loadMemberCookie());
    session = member ? { member, sessionId: ++nextSessionId } : signedOut;
  }
  return session;
};

const publish = (next) => {
  const previous = getSession();
  session = next;
  if (next.member) {
    saveMemberCookie(next.member);
  } else {
    removeMemberCookie();
  }
  if (next.sessionId !== previous.sessionId) {
    queryClient.clear();
  }
  listeners.forEach((listener) => listener(next));
};

export const startSession = (data) => {
  const member = memberInfo(data);
  if (!member) throw new Error('Invalid login response');
  publish({ member, sessionId: ++nextSessionId });
  return member;
};

export const endSession = () => publish(signedOut);

export const updateSessionTokens = (sessionId, accessToken, refreshToken) => {
  const current = getSession();
  if (current.member && current.sessionId === sessionId) {
    publish({ sessionId, member: { ...current.member, accessToken, refreshToken } });
  }
};

const signinState = atom({
  key: 'signinState',
  default: signedOut,
  effects: [
    ({ setSelf }) => {
      setSelf(getSession());
      listeners.add(setSelf);
      return () => listeners.delete(setSelf);
    },
  ],
});

export default signinState;
