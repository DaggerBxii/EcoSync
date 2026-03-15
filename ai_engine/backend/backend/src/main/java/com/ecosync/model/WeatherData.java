package com.ecosync.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Weather data model for OpenWeatherMap API response
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherData {

    private Main main;
    private Weather[] weather;
    private Wind wind;
    private String name;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Main {
        private double temp;
        private double feels_like;
        private int humidity;
        private double pressure;

        public double getTemp() {
            return temp;
        }

        public void setTemp(double temp) {
            this.temp = temp;
        }

        public double getFeelsLike() {
            return feels_like;
        }

        public void setFeelsLike(double feels_like) {
            this.feels_like = feels_like;
        }

        public int getHumidity() {
            return humidity;
        }

        public void setHumidity(int humidity) {
            this.humidity = humidity;
        }

        public double getPressure() {
            return pressure;
        }

        public void setPressure(double pressure) {
            this.pressure = pressure;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Weather {
        private String main;
        private String description;
        private String icon;

        public String getMain() {
            return main;
        }

        public void setMain(String main) {
            this.main = main;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Wind {
        private double speed;
        private int deg;

        public double getSpeed() {
            return speed;
        }

        public void setSpeed(double speed) {
            this.speed = speed;
        }

        public int getDeg() {
            return deg;
        }

        public void setDeg(int deg) {
            this.deg = deg;
        }
    }

    // Getters and Setters
    public Main getMain() {
        return main;
    }

    public void setMain(Main main) {
        this.main = main;
    }

    public Weather[] getWeather() {
        return weather;
    }

    public void setWeather(Weather[] weather) {
        this.weather = weather;
    }

    public Wind getWind() {
        return wind;
    }

    public void setWind(Wind wind) {
        this.wind = wind;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getTemperature() {
        return main != null ? main.getTemp() : 20.0;
    }

    public int getHumidity() {
        return main != null ? main.getHumidity() : 50;
    }

    public String getCondition() {
        if (weather != null && weather.length > 0) {
            return weather[0].getMain();
        }
        return "Clear";
    }

    public String getDescription() {
        if (weather != null && weather.length > 0) {
            return weather[0].getDescription();
        }
        return "clear sky";
    }

    public double getWindSpeed() {
        return wind != null ? wind.getSpeed() : 0;
    }
}
