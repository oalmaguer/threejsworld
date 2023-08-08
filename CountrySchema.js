const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema(
  {
    _id: String,
    country: String,
    density: String,
    abbreviation: String,
    agricultural_land: String,
    land_area: String,
    armed_forces_size: String,
    birth_rate: Number,
    calling_code: Number,
    capital_major_city: String,
    co2_emissions: String,
    cpi: String,
    cpi_change: String,
    currency_code: String,
    fertility_rate: Number,
    forested_area: String,
    gasoline_price: String,
    gdp: String,
    gross_primary_education_enrollment: String,
    gross_tertiary_education_enrollment: String,
    infant_mortality: Number,
    largest_city: String,
    life_expectancy: Number,
    maternal_mortality_ratio: Number,
    minimum_wage: String,
    official_language: String,
    out_of_pocket_health_expenditure: String,
    physicians_per_thousand: Number,
    population: String,
    population_labor_force_participation: String,
    tax_revenue: String,
    total_tax_rate: String,
    unemployment_rate: String,
    urban_population: String,
    latitude: Number,
    longitude: Number,
  },
  {
    collection: "countries",
  }
);

const Country = mongoose.model("Country", CountrySchema);

module.exports = Country;
