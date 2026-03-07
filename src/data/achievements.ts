export type Achievement = {
  id: string
  title: string
  date: string
  summary: string
  content: string
}

export const achievements: Achievement[] = [
    {
        id: "yantra-central-hackathon",
        title: "Yantra Hackathon Winner 2026",
        date: "February 2026",
        summary: "Yantra Hackathon Winner 2026",
        content:
            "Won Track Winner for Best CS/IT Project out of 250 teams for building a Web3-based AI-powered IoT application designed to modernize municipal complaint management by combining citizen reporting, intelligent automation, and transparent governance. The platform included a Swift-based iOS application that allowed citizens to capture and upload images of civic issues with location metadata, and a Django-powered backend with structured Role-Based Access Control (RBAC) to manage authentication, complaint routing, and lifecycle workflows. Municipal authorities accessed a Vite + React dashboard that provided a filterable complaint feed, departmental segmentation, priority tagging, and resolution tracking, enabling systematic and scalable handling of large volumes of civic tickets.\n\nA core differentiator of the system was its AI/ML pipeline, which combined a Convolutional Neural Network (CNN) and a Small Language Model (SLM). The CNN analyzed uploaded images to classify issues such as potholes, garbage overflow, or structural damage, while the SLM processed textual descriptions to refine categorization, extract urgency indicators, and validate contextual consistency. This hybrid model significantly reduced manual triaging effort and improved routing accuracy before complaints reached municipal departments, making the workflow both faster and more reliable.\n\nThe platform also integrated IoT and blockchain layers to enhance proactivity and transparency. ESP32-based sensors monitored environmental factors such as pollution levels, seismic activity, and structural vibrations, allowing the system to generate automated alerts when anomalies crossed predefined thresholds. To ensure accountability, a Web3-based logging mechanism immutably recorded complaint submissions and status updates, creating an auditable trail resistant to tampering. Together, the AI-driven automation, IoT-based monitoring, and blockchain-backed transparency transformed the platform from a simple complaint portal into a scalable, intelligent civic governance system.",
    },
    {
        id: "devsoc'26",
        title: "DevSOC'26 CodeChef-VIT Winners",
        date: "November 2024",
        summary: "DevSOC'26 CodeChef-VIT",
        content:
            "Won Track Winner in Tech for Good among 180 teams for building a Web3-based AI-powered municipal complaint management platform designed to modernize civic issue reporting through intelligent automation and transparent governance. The system included a Swift-based iOS application that allowed citizens to capture and upload images of civic issues with location metadata, and a Django-powered backend with structured Role-Based Access Control (RBAC) to manage authentication, complaint routing, and lifecycle workflows. Municipal authorities accessed a Vite + React dashboard that provided a filterable complaint feed, departmental segmentation, priority tagging, and resolution tracking, enabling systematic and scalable handling of civic tickets.\n\n A core differentiator of the platform was its AI/ML pipeline, which combined a Convolutional Neural Network (CNN) and a Small Language Model (SLM). The CNN analyzed uploaded images to classify issues such as potholes, garbage overflow, or structural damage, while the SLM processed textual descriptions to refine categorization, extract urgency indicators, and validate contextual consistency. This hybrid model significantly reduced manual triaging effort and improved routing accuracy before complaints reached municipal departments, making the workflow both faster and more reliable.\n\nTo further strengthen accountability, a Web3-based logging mechanism was integrated to immutably record complaint submissions and status updates, creating an auditable and tamper-resistant trail of actions. By combining AI-driven automation with blockchain-backed transparency, the platform evolved beyond a traditional complaint portal into a scalable civic-tech solution focused on efficiency, accuracy, and public trust.",
    },
    {
        id: "ios-fusion-25",
        title: "IoS Fusion 25 Apple Developers Group",
        date: "September 2025",
        summary: "IoS Fusion 25 Best Idea",
        content:
            "Won Best Idea among 60 participating teams for conceptualizing and developing a mobile application aimed at enabling early detection of common eye diseases using on-device machine learning. The solution focused on making preliminary eye health screening more accessible by allowing users to capture images of their eyes through a simple mobile interface. The application was built using Swift and designed to run inference locally, ensuring faster results, offline capability, and improved user privacy by avoiding the need to transmit sensitive medical images to external servers.\n\nThe core detection system was built using TensorFlow and OpenCV, where a machine learning model was trained to identify visual indicators of conditions such as cataract, glaucoma, and conjunctivitis from eye images. Once trained, the model was converted into Apple’s .mlmodel format using the CoreML framework, allowing it to run natively on the device. This integration enabled real-time analysis directly on the user’s phone, leveraging Apple’s optimized on-device ML pipeline for efficient and responsive predictions without requiring cloud-based processing.\n\nBeyond detection, the application also aimed to guide users toward timely medical consultation. Based on the analysis results, the app could suggest nearby ophthalmologists or clinics for further diagnosis and treatment. Authentication and user management were handled through OAuth, ensuring secure access while maintaining a smooth user experience. The project demonstrated how mobile development and on-device machine learning could be combined to create accessible, privacy-conscious healthcare screening tools.",
    }
]
