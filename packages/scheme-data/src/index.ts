import { Scheme, SchemeFilters } from '@arivom-thittam/api-contracts';

export interface SchemeRepositoryResponse {
  schemes: Scheme[];
  status: 'SUCCESS' | 'NO_DATA' | 'ERROR';
  totalCount: number;
  message?: string;
}

/**
 * Standard SchemeRepository interface across Web and Android.
 */
export interface SchemeRepository {
  getSchemes(): Promise<SchemeRepositoryResponse>;
  getSchemeById(id: string): Promise<Scheme | null>;
  searchSchemes(filters: SchemeFilters): Promise<Scheme[]>;
}

/**
 * Base repository implementation defaulting to empty production-ready state.
 */
export class ProductionSchemeRepository implements SchemeRepository {
  private schemes: Scheme[];

  constructor(initialSchemes: Scheme[] = []) {
    this.schemes = initialSchemes;
  }

  async getSchemes(): Promise<SchemeRepositoryResponse> {
    if (this.schemes.length === 0) {
      return {
        schemes: [],
        status: 'NO_DATA',
        totalCount: 0,
        message: 'No government schemes loaded in repository. Connect to verified government API or database.',
      };
    }
    return {
      schemes: [...this.schemes],
      status: 'SUCCESS',
      totalCount: this.schemes.length,
    };
  }

  async getSchemeById(id: string): Promise<Scheme | null> {
    return this.schemes.find((s) => s.id === id) || null;
  }

  async searchSchemes(filters: SchemeFilters): Promise<Scheme[]> {
    return this.schemes.filter((scheme) => {
      if (filters.state && filters.state !== 'ALL' && scheme.stateId !== 'ALL' && scheme.stateId !== filters.state) {
        return false;
      }
      if (filters.category && scheme.category !== filters.category) {
        return false;
      }
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchName = scheme.name.toLowerCase().includes(q);
        const matchDept = scheme.department.toLowerCase().includes(q);
        if (!matchName && !matchDept) return false;
      }
      return true;
    });
  }
}

export const defaultSchemeRepository = new ProductionSchemeRepository([]);

