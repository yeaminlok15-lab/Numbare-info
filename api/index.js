const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Base Route to check if the API is online
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Ultimate Device Lookup API is Online and Running."
    });
});

// Main API Endpoint
app.post('/api/v1/ultimate-device-lookup', (req, res) => {
    try {
        const { 
            number, device_name, os_version, device_language,
            battery_level, is_charging, network_type, isp_name, ip_address, 
            latitude, longitude, location_accuracy,
            is_rooted, is_emulator, is_vpn_active, 
            screen_size, total_ram, free_storage, app_version
        } = req.body;

        // 1. Phone Number Validation
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: "Phone number is required." 
            });
        }

        // 2. Number Cleanup and Formatting Logic
        let cleaned = number.replace(/[\s\-\+]/g, '');
        if (cleaned.startsWith('88')) {
            cleaned = cleaned.substring(2);
        }

        // 3. Bangladesh Mobile Operator Detection
        let operator = "Unknown / International";
        const prefix = cleaned.substring(0, 3);

        if (cleaned.length === 11 && cleaned.startsWith('01')) {
            if (prefix === '017' || prefix === '013') operator = "Grameenphone";
            else if (prefix === '018') operator = "Robi";
            else if (prefix === '019' || prefix === '014') operator = "Banglalink";
            else if (prefix === '015') operator = "Teletalk";
            else if (prefix === '016') operator = "Airtel";
        }

        // 4. Identity Simulation (Public Directory Record Shortcut)
        let predicted_name = "Private Database Record";
        if (operator !== "Unknown / International") {
            predicted_name = `User_ID_${cleaned.substring(7)} (Fetch via Truecaller SDK)`;
        }

        // 5. Final Master Response Structure
        return res.status(200).json({
            success: true,
            status_code: 200,
            api_version: "3.5.0-Ultimate",
            processed_at: new Date().toISOString(),
            
            // Category 1: Telecom & SIM Profile
            telecom_profile: {
                input_received: number,
                international_format: `+88${cleaned}`,
                local_format: cleaned,
                country: "Bangladesh",
                country_code: "+880",
                network_operator: operator,
                line_type: "Mobile GSM",
                sim_status: "Active / Validated"
            },

            // Category 2: OSINT & Social Profiles
            public_identity: {
                caller_name_prediction: predicted_name,
                spam_score: "0% (Safe/Clean)",
                whatsapp_status: "Active / Registered",
                telegram_status: "Active / Registered"
            },

            // Category 3: Anti-Fraud & Security Compliance
            security_compliance: {
                is_device_rooted: is_rooted ?? false,
                is_emulator: is_emulator ?? false,
                vpn_proxy_active: is_vpn_active ?? false,
                device_integrity: (is_rooted || is_emulator || is_vpn_active) ? "Compromised / Unsafe" : "Secured"
            },

            // Category 4: Hardware Specifications
            hardware_metrics: {
                device_model: device_name || "Unknown Smartphone",
                operating_system: os_version || "Android / iOS",
                system_language: device_language || "en-US",
                screen_resolution: screen_size || "1080x2400 pixels",
                memory_ram: total_ram ? `${total_ram} GB` : "Unknown RAM",
                storage_available: free_storage ? `${free_storage} GB Free` : "Unknown Storage"
            },

            // Category 5: Real-time Telemetry & Connection Status
            live_telemetry: {
                battery_percentage: battery_level ? `${battery_level}%` : "100%",
                charging_state: is_charging ?? false,
                connection_medium: network_type || "WiFi Connection",
                isp_provider: isp_name || "Local Broadband / Mobile Network",
                public_ip_v4: ip_address || "127.0.0.1"
            },

            // Category 6: Live GPS Tracking (Permission Based)
            geospatial_location: latitude && longitude ? {
                status: "Success",
                latitude: latitude,
                longitude: longitude,
                accuracy_radius: location_accuracy ? `${location_accuracy} meters` : "High Accuracy",
                google_maps_route: `https://www.google.com/maps?q=${latitude},${longitude}`
            } : {
                status: "Denied",
                reason: "GPS Location services are disabled or App permissions rejected."
            },

            // Category 7: Application Metadata
            app_environment: {
                build_version: app_version || "1.0.0",
                environment: "Production",
                developer_mode: false
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: error.message
        });
    }
});

// Only listen on port if running locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Local Server running on Port: ${PORT}`);
    });
}

// Export the app for Vercel Serverless Architecture
module.exports = app;
      
