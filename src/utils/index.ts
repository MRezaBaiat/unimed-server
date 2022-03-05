type KeysOf<K, V> = {
    [P in keyof K]: V
};

export default KeysOf;

export const defaultPrivilegeTestFunctionString = '(function(privilegeOptions,req){ return privilegeOptions[req.method.toLowerCase()].allowed; })';

export function findLanguageFromMobile (mobile: string): 'fa' | 'az' {
  if (mobile.startsWith('994')) {
    return 'az';
  } else {
    return 'fa';
  }
}
