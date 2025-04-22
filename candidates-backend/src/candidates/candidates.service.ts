import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class CandidatesService {
  async processCandidate(
    name: string,
    surname: string,
    file: Express.Multer.File,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Read the sheet as an array of arrays (no header assumed)
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!data || data.length === 0 || data[0].length < 3) { // Check if there's at least one row with 3 columns
      throw new BadRequestException(
        'Excel file is empty or does not contain the expected data format (single row, 3 columns).',
      );
    }

    // Assuming the first row contains the data without header
    const candidateData = data[0];

    // Extract and validate data by index with type assertions
    const seniority = candidateData[0] as string;
    const years = candidateData[1]; // Keep as any for parsing logic
    const availability = candidateData[2]; // Keep as any for parsing logic

    if (typeof seniority !== 'string' || !['junior', 'senior'].includes(seniority.toLowerCase())) {
      throw new BadRequestException(
        'Invalid or missing Seniority in Excel. Must be "junior" or "senior".',
      );
    }

    // Attempt to parse years as a number if it's not already
    let yearsNumber: number;
    if (typeof years === 'number') {
        yearsNumber = years;
    } else if (typeof years === 'string') {
        yearsNumber = parseFloat(years);
        if (isNaN(yearsNumber)) {
             throw new BadRequestException('Invalid Years of experience in Excel. Must be a number.');
        }
    } else {
        throw new BadRequestException('Invalid or missing Years of experience in Excel. Must be a number.');
    }

    if (yearsNumber < 0) {
         throw new BadRequestException('Years of experience in Excel must be a non-negative number.');
    }


    // Excel reads boolean as 1 or 0, or sometimes true/false strings
    let availabilityBoolean: boolean;
    if (typeof availability === 'boolean') {
        availabilityBoolean = availability;
    } else if (typeof availability === 'number') {
        availabilityBoolean = availability === 1;
    } else if (typeof availability === 'string') {
        availabilityBoolean = availability.toLowerCase() === 'true';
    } else {
        throw new BadRequestException(
          'Invalid or missing Availability in Excel. Must be a boolean (true/false) or 1/0.',
        );
    }


    return {
      name,
      surname,
      seniority: seniority.toLowerCase(),
      years: yearsNumber,
      availability: availabilityBoolean,
    };
  }
}
