import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const BLACKLIST = ['blocked', 'blocked2'];

@ValidatorConstraint({ async: false })
class IsNotBlacklistedConstraint implements ValidatorConstraintInterface {
  validate(query: string): boolean {
    return !BLACKLIST.includes(query.toLowerCase());
  }

  defaultMessage(): string {
    return 'Query contains a blacklisted term';
  }
}

export function IsNotBlacklisted(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotBlacklistedConstraint,
    });
  };
}
