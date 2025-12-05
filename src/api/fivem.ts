import axios, { AxiosInstance } from 'axios';

interface Player {
  netid?: number;
  mutex?: string;
  license: string;
  displayName: string;
  isOnline: boolean;
}

export class FiveMAPI {
  private client: AxiosInstance;
  private csrfToken: string = '';
  private cookies: string = '';
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.client = axios.create({
      baseURL: this.baseUrl,
    });

    this.client.interceptors.response.use(
      (res) => {
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          this.cookies = setCookie.map((c: string) => c.split(';')[0]).join('; ');
          this.client.defaults.headers.common['Cookie'] = this.cookies;
        }
        return res;
      },
      (error) => {
        throw error;
      }
    );
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const res = await this.client.post('/auth/password?uiVersion=8.0.1', {
        username,
        password,
      });
      this.csrfToken = res.data.csrfToken;
      this.client.defaults.headers.common['x-txadmin-csrftoken'] = this.csrfToken;
      return true;
    } catch {
      return false;
    }
  }

  async getOnlinePlayers(): Promise<Player[]> {
    try {
      const res = await this.client.get('/player/search?sortingKey=tsJoined&sortingDesc=true');
      return res.data.players?.filter((p: Player) => p.isOnline === true) || [];
    } catch {
      return [];
    }
  }

  async getOfflinePlayers(): Promise<Player[]> {
    try {
      const res = await this.client.get('/player/search?sortingKey=tsJoined&sortingDesc=true');
      return res.data.players?.filter((p: Player) => p.isOnline === false) || [];
    } catch {
      return [];
    }
  }

  async getAllPlayers(): Promise<Player[]> {
    try {
      const res = await this.client.get('/player/search?sortingKey=tsJoined&sortingDesc=true');
      return res.data.players || [];
    } catch {
      return [];
    }
  }

  async banOnlinePlayer(mutex: string, netid: number, reason: string, duration: string): Promise<boolean> {
    try {
      await this.client.post(`/player/ban?mutex=${mutex}&netid=${netid}`, {
        reason,
        duration,
      });
      return true;
    } catch {
      return false;
    }
  }

  async banOfflinePlayer(license: string, reason: string, duration: string): Promise<boolean> {
    try {
      await this.client.post(`/player/ban?license=${license}`, {
        reason,
        duration,
      });
      return true;
    } catch {
      return false;
    }
  }
}
