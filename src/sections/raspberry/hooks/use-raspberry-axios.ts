import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

import { BACKEND_URL } from 'src/config-global';

// 1. Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000, // 10초 타임아웃 설정 (선택)
});

// 2. 요청(Request) 인터셉터 설정
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 모든 요청에 공통 헤더 추가
    config.headers['accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';

    // 필요한 경우 인증 토큰 등도 이곳에서 추가할 수 있습니다.
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => Promise.reject(error)
);

// 3. 응답(Response) 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 모든 요청에 대한 공통 에러 처리 로직
    console.error('[API Error]:', error.response?.status, error.message);

    // 예: 401 Unauthorized 에러 시 로그인 페이지로 강제 이동 등의 처리 가능
    // if (error.response?.status === 401) {
    //   window.location.href = '/login';
    // }

    return Promise.reject(error);
  }
);

/**
 * 라즈베리파이로 커스텀 명령을 전송합니다.
 * @param ipAddress 대상 기기 IP 주소
 * @param commandText 실행할 명령 (예: 'LED on red')
 */
export const sendRaspberryCommand = async (ipAddress: string, commandText: string) => {
  // 인스턴스의 baseURL과 인터셉터를 타므로 URL 뒷부분과 데이터만 넘기면 됩니다.
  const response = await apiClient.post('/api/v1/send_command', {
    target_device_ip: ipAddress,
    command_text: commandText,
  });
  return response.data;
};

/**
 * 라즈베리파이 명령의 백그라운드 실행 상태를 조회합니다.
 * @param commandId 조회할 명령 ID
 */
export const getCommandStatus = async (commandId: number) => {
  const response = await apiClient.get(`/api/v1/command/${commandId}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
  return response.data;
};

/**
 * 라즈베리파이 테스트 프로그램 명령을 전송합니다.
 * @param ipAddress 대상 기기 IP 주소
 * @param action 실행할 명령 ('start' | 'stop')
 */
export const sendTestCommand = async (ipAddress: string, action: 'start' | 'stop') => {
  const response = await apiClient.post(`/api/v1/raspberry/test/${action}`, null, {
    params: { target_device_ip: ipAddress },
  });
  return response.data;
};

/**
 * 라즈베리파이의 대기열(Queue) 목록을 조회합니다.
 * @param ipAddress 대상 기기 IP 주소
 */
export const fetchRaspberryQueue = async (ipAddress: string) => {
  const response = await apiClient.get(`/api/v1/raspberry/pgm_queue`, {
    params: { target_device_ip: ipAddress },
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
  return response.data;
};

/**
 * 라즈베리파이의 대기열(Queue)에 새 테스트를 추가합니다.
 * @param payload 추가할 테스트 정보
 */
export const addRaspberryQueue = async (
  payload: { name: string; target_device_ip: string }
) => {
  const response = await apiClient.post(`/api/v1/raspberry/pgm_queue`, payload);
  return response.data;
};

/**
 * 라즈베리파이의 대기열(Queue)에서 특정 테스트를 삭제합니다.
 * @param id 삭제할 테스트 ID
 */
export const removeRaspberryQueue = async (id: number) => {
  const response = await apiClient.delete(`/api/v1/raspberry/pgm_queue/${id}`);
  return response.data;
};
