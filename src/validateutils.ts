import {
    ValidationOptions,
    Matches,
} from 'class-validator';

export function IsHexString(validationOptions?: ValidationOptions) {
    validationOptions = {};
    validationOptions.message = "Value is not hexadecimal string";
    return Matches(/^0[xX][0-9a-fA-F]+$/, validationOptions);
}

export function IsDID(validationOptions?: ValidationOptions) {
    validationOptions = {};
    validationOptions.message = "Value is not DID";
    return Matches(/^did:(ethr|klay):(ropsten:)?0[xX][0-9a-fA-F]+$/, validationOptions);
}
