type KeysOf<K, V> = {
    [P in keyof K]: V
};

export default KeysOf;

export const defaultPrivilegeTestFunctionString = '(function(privilegeOptions,req){ return privilegeOptions[req.method.toLowerCase()].allowed; })';
