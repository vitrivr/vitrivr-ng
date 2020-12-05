import {Role} from './role.model';

export class UserDetails {
  constructor(public id: string, public username: string, public role: Role, public sessionId: String) {
  }
}
