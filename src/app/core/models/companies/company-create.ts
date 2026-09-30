export interface CompanyCreate {
    userId: number;
    cnpj: string;
    registeredCompanyName: string;
    averageRevenue: number;
    ageInMonths: number;
    numberOfEmployees: number;
}
