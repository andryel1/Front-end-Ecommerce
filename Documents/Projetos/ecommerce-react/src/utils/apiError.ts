export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: any): never => {
  if (error.response) {
    // Erro de resposta do servidor
    const { status, data } = error.response;
    const message = data?.message || 'Erro no servidor';
    throw new ApiError(message, status, data);
  } else if (error.request) {
    // Erro de rede
    throw new ApiError('Erro de conexão', 0);
  } else {
    // Outro tipo de erro
    throw new ApiError(error.message || 'Erro desconhecido', 0);
  }
};
