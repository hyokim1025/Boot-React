import { Cookies } from 'react-cookie';

const cookies = new Cookies();
const options = { path: '/', sameSite: 'strict', secure: window.location.protocol === 'https:' };

export const loadMemberCookie = () => cookies.get('member');

export const saveMemberCookie = (member) => {
  cookies.set('member', member, { ...options, maxAge: 24 * 60 * 60 });
};

export const removeMemberCookie = () => cookies.remove('member', options);
