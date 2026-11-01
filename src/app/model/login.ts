export interface LoginCredentials {
	usuario: string;
	senha: string;
}

export interface LoginUser extends LoginCredentials {
	id: number;
}
