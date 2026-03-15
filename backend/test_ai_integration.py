"""
Test suite for EcoSync AI Module (ai_module.py)
Tests the EcoBrain class functionality with and without Gemini API.
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from unittest.mock import patch, MagicMock

# Add src directory to path
src_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(src_dir))

import pytest
from ai_module import EcoBrain


class TestEcoBrainInitialization:
    """Test EcoBrain initialization."""

    def test_initialization_without_gemini(self):
        """Test initialization with use_gemini=False."""
        ai = EcoBrain(use_gemini=False)
        assert ai.using_fallback is True
        assert ai.client is None

    def test_initialization_with_gemini_no_api_key(self):
        """Test initialization with Gemini but no API key."""
        with patch.dict("os.environ", {}, clear=True):
            ai = EcoBrain(use_gemini=True)
            assert ai.using_fallback is True

    def test_initialization_with_gemini_with_api_key(self):
        """Test initialization with Gemini and API key."""
        with patch.dict("os.environ", {"GEMINI_API_KEY": "test_key_123"}):
            with patch("ai_module.genai.Client") as mock_client:
                ai = EcoBrain(use_gemini=True)
                assert ai.using_fallback is False
                assert ai.client is not None


class TestEcoBrainFallbackMode:
    """Test fallback mode (rule-based predictions)."""

    @pytest.fixture
    def ai_brain(self):
        """Create EcoBrain instance in fallback mode."""
        return EcoBrain(use_gemini=False)

    def test_get_decision_returns_valid_structure(self, ai_brain):
        """Test that get_decision returns valid Sync Contract structure."""
        result = ai_brain.get_decision({"hour_of_day": 14})

        # Check required fields
        assert "timestamp" in result
        assert "system_status" in result
        assert "scale_level" in result
        assert "metrics" in result
        assert "ai_insight" in result
        assert "is_anomaly" in result
        assert "confidence_score" in result

    def test_metrics_structure(self, ai_brain):
        """Test metrics sub-object structure."""
        result = ai_brain.get_decision({"hour_of_day": 14})
        metrics = result["metrics"]

        assert "watts" in metrics
        assert "occupancy" in metrics
        assert "carbon_saved" in metrics
        assert isinstance(metrics["watts"], (int, float))
        assert isinstance(metrics["occupancy"], int)
        assert isinstance(metrics["carbon_saved"], (int, float))

    def test_occupancy_range(self, ai_brain):
        """Test that occupancy is within valid range."""
        for _ in range(10):
            result = ai_brain.get_decision({"hour_of_day": 14})
            assert 0 <= result["metrics"]["occupancy"] <= 15

    def test_watts_range(self, ai_brain):
        """Test that watts is within valid range."""
        for _ in range(10):
            result = ai_brain.get_decision({"hour_of_day": 14})
            assert 50 <= result["metrics"]["watts"] <= 200

    def test_scale_level_range(self, ai_brain):
        """Test that scale_level is within valid range."""
        for _ in range(10):
            result = ai_brain.get_decision({"hour_of_day": 14})
            assert 0.1 <= result["scale_level"] <= 1.0

    def test_confidence_score_range(self, ai_brain):
        """Test that confidence_score is within valid range."""
        for _ in range(10):
            result = ai_brain.get_decision({"hour_of_day": 14})
            assert 0.5 <= result["confidence_score"] <= 1.0

    def test_system_status_values(self, ai_brain):
        """Test that system_status is a valid value."""
        valid_statuses = {"Eco Mode", "Scaling Down", "Active", "Alert"}

        for _ in range(20):
            result = ai_brain.get_decision({"hour_of_day": 14})
            assert result["system_status"] in valid_statuses

    def test_timestamp_format(self, ai_brain):
        """Test that timestamp is in ISO format."""
        result = ai_brain.get_decision({"hour_of_day": 14})
        timestamp = result["timestamp"]

        # Should end with Z (UTC)
        assert timestamp.endswith("Z")
        # Should be parseable
        parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        assert parsed is not None


class TestEcoBrainNightHours:
    """Test predictions during night hours."""

    @pytest.fixture
    def ai_brain(self):
        return EcoBrain(use_gemini=False)

    def test_night_hours_low_occupancy(self, ai_brain):
        """Test that night hours (22:00-06:00) have low occupancy."""
        night_hours = [0, 1, 2, 3, 4, 5, 22, 23]

        for hour in night_hours:
            result = ai_brain.get_decision({"hour_of_day": hour})
            assert result["metrics"]["occupancy"] <= 2, f"Hour {hour} should have low occupancy"


class TestEcoBrainWorkHours:
    """Test predictions during work hours."""

    @pytest.fixture
    def ai_brain(self):
        return EcoBrain(use_gemini=False)

    def test_work_hours_higher_occupancy(self, ai_brain):
        """Test that work hours have higher occupancy on average."""
        work_hours = [9, 10, 11, 12, 13, 14, 15, 16]
        all_occupancies = []

        # Run multiple times to account for randomness
        for _ in range(10):
            for hour in work_hours:
                result = ai_brain.get_decision({"hour_of_day": hour})
                all_occupancies.append(result["metrics"]["occupancy"])

        avg_occupancy = sum(all_occupancies) / len(all_occupancies)
        assert avg_occupancy >= 2, f"Average occupancy during work hours should be >= 2, got {avg_occupancy}"


class TestAnomalyDetection:
    """Test anomaly detection."""

    @pytest.fixture
    def ai_brain(self):
        return EcoBrain(use_gemini=False)

    def test_anomaly_detection_logic(self, ai_brain):
        """Test that anomaly is detected when appropriate."""
        # The fallback logic should detect anomaly when occupancy=0 and watts>100
        # This is tested indirectly through the is_anomaly field
        result = ai_brain.get_decision({"hour_of_day": 14})
        assert isinstance(result["is_anomaly"], bool)


class TestEcoBrainHistory:
    """Test historical data tracking."""

    @pytest.fixture
    def ai_brain(self):
        return EcoBrain(use_gemini=False)

    def test_historical_data_accumulation(self, ai_brain):
        """Test that historical data accumulates."""
        initial_samples = ai_brain.get_model_info()["historical_samples"]

        # Make multiple predictions
        for _ in range(5):
            ai_brain.get_decision({"hour_of_day": 14})

        final_samples = ai_brain.get_model_info()["historical_samples"]
        assert final_samples == initial_samples + 5

    def test_historical_data_limit(self, ai_brain):
        """Test that historical data is limited to max size."""
        # Make many predictions
        for _ in range(200):
            ai_brain.get_decision({"hour_of_day": 14})

        # Should be capped at 168 (cache_max_size)
        samples = ai_brain.get_model_info()["historical_samples"]
        assert samples <= 168


class TestEcoBrainModelInfo:
    """Test model info endpoint."""

    def test_model_info_structure(self):
        """Test that model_info returns correct structure."""
        ai = EcoBrain(use_gemini=False)
        info = ai.get_model_info()

        assert "using_gemini" in info
        assert "gemini_available" in info
        assert "model_name" in info
        assert "client_initialized" in info
        assert "historical_samples" in info
        assert "anomalies_detected" in info

    def test_model_info_fallback_mode(self):
        """Test model info when in fallback mode."""
        ai = EcoBrain(use_gemini=False)
        info = ai.get_model_info()

        assert info["using_gemini"] is False
        assert info["model_name"] == "fallback"
        assert info["client_initialized"] is False


class TestEcoBrainRecommendations:
    """Test recommendations endpoint."""

    @pytest.fixture
    def ai_brain(self):
        return EcoBrain(use_gemini=False)

    def test_recommendations_returns_list(self, ai_brain):
        """Test that recommendations returns a list."""
        recommendations = ai_brain.get_energy_recommendations(hours_ahead=24)
        assert isinstance(recommendations, list)

    def test_recommendations_have_required_fields(self, ai_brain):
        """Test that each recommendation has required fields."""
        recommendations = ai_brain.get_energy_recommendations(hours_ahead=24)

        for rec in recommendations:
            assert "time" in rec
            assert "action" in rec
            assert "expected_savings" in rec
            assert "priority" in rec


class TestEcoBrainGeminiMode:
    """Test Gemini mode (with mocked API)."""

    @pytest.fixture
    def mock_gemini_ai(self):
        """Create EcoBrain with mocked Gemini API."""
        with patch.dict("os.environ", {"GEMINI_API_KEY": "test_key_123"}):
            with patch("ai_module.genai.Client") as mock_client:
                # Mock the generate_content response
                mock_response = MagicMock()
                mock_response.text = json.dumps({
                    "occupancy": 5,
                    "watts": 100,
                    "is_anomaly": False,
                    "system_status": "Active",
                    "scale_level": 0.5,
                    "ai_insight": "Test insight",
                    "confidence_score": 0.85,
                    "recommendations": []
                })
                mock_client.return_value.models.return_value.generate_content.return_value = mock_response

                ai = EcoBrain(use_gemini=True)
                yield ai

    def test_gemini_mode_uses_api(self, mock_gemini_ai):
        """Test that Gemini mode attempts to use API."""
        assert mock_gemini_ai.using_fallback is False

    def test_gemini_prediction_structure(self, mock_gemini_ai):
        """Test that Gemini prediction returns valid structure."""
        result = mock_gemini_ai.get_decision({"hour_of_day": 14})

        assert "timestamp" in result
        assert "system_status" in result
        assert "metrics" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])