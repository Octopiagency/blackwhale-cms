export interface UserPhone {
  code: number;
  number: number;
}

export interface UserImage {
  path: string;
  _id: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: UserPhone;
  gender: "male" | "female" | "other";
  dob: string;
  image?: UserImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: {
    code: string;
    number: string;
  };
  gender: string;
  dob: string;
  image: File | null;
  isActive: boolean;
}

export interface UsersResponse {
  data: User[];
  totalCount: number;
}

export interface DeleteUserRequest {
  id: string;
}
