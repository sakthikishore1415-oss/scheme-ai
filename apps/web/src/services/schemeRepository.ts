import { Scheme, SchemeFilters } from '../types';

export interface SchemeRepositoryResponse {
  schemes: Scheme[];
  status: 'SUCCESS' | 'NO_DATA' | 'ERROR';
  message?: string;
}

export interface SchemeRepository {
  getSchemes(): Promise<SchemeRepositoryResponse>;
  getSchemeById(id: string): Promise<Scheme | null>;
  searchSchemes(filters: SchemeFilters): Promise<Scheme[]>;
}

export class ProductionSchemeRepository implements SchemeRepository {
  private schemes: Scheme[] = [];

  constructor(initialSchemes: Scheme[] = []) {
    this.schemes = initialSchemes;
  }

  async getSchemes(): Promise<SchemeRepositoryResponse> {
    if (this.schemes.length === 0) {
      return {
        schemes: [],
        status: 'NO_DATA',
        message: 'No government schemes loaded from connected repository or backend.',
      };
    }
    return {
      schemes: this.schemes,
      status: 'SUCCESS',
    };
  }

  async getSchemeById(id: string): Promise<Scheme | null> {
    return this.schemes.find((s) => s.id === id) || null;
  }

  async searchSchemes(filters: SchemeFilters): Promise<Scheme[]> {
    return this.schemes.filter((s) => {
      if (filters.stateId && filters.stateId !== 'ALL' && s.stateId !== 'ALL' && s.stateId !== filters.stateId) {
        return false;
      }
      if (filters.category && filters.category !== 'ALL' && s.category !== filters.category) {
        return false;
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNative = s.nativeName?.toLowerCase().includes(q);
        const matchDept = (s.department || s.authority || '').toLowerCase().includes(q);
        if (!matchName && !matchNative && !matchDept) return false;
      }
      return true;
    });
  }
}

export const defaultSchemeRepository: SchemeRepository = new ProductionSchemeRepository([]);

