// File: client/src/components/Visualizations.js
import React, { useState, Suspense, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios'; // <-- FIX: Added the missing import
import { Bar, Line, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import jsPDF from 'jspdf';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useDashboard } from '../context/DashboardContext';
import styles from './Visualizations.module.css';

// Register all necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, zoomPlugin);

const chartOptions2D = ['Bar Chart', 'Line Chart', 'Pie Chart', 'Doughnut Chart', 'Polar Area Chart'];
const chartOptions3D = ['3D Scatter Plot', '3D Bar Chart'];
const singleAxisCharts = ['Pie Chart', 'Doughnut Chart', 'Polar Area Chart'];

// --- Helper component to trigger 3D scene capture ---
const SceneCapturer = ({ onCaptureTrigger }) => {
    const { gl } = useThree();
    useEffect(() => {
        if (onCaptureTrigger) {
            setTimeout(() => {
                const image = gl.domElement.toDataURL(`image/${onCaptureTrigger.format}`);
                onCaptureTrigger.callback(image);
            }, 100);
        }
    }, [onCaptureTrigger, gl]);
    return null;
};

// --- 3D Scatter Plot Component ---
const Chart3DScatter = ({ data, xAxis, yAxis, zAxis }) => {
    const points = useMemo(() => data.map(d => ({ x: parseFloat(d[xAxis]), y: parseFloat(d[yAxis]), z: parseFloat(d[zAxis]) })).filter(p => !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.z)), [data, xAxis, yAxis, zAxis]);
    const { maxX, maxY, maxZ } = useMemo(() => ({ maxX: Math.max(...points.map(p => Math.abs(p.x))), maxY: Math.max(...points.map(p => Math.abs(p.y))), maxZ: Math.max(...points.map(p => Math.abs(p.z))) }), [points]);
    if (points.length === 0) return <Text>No valid numeric data for a 3D scatter plot.</Text>;
    return (<>{points.map((p, i) => <mesh key={i} position={[maxX > 0 ? (p.x / maxX) * 5 : 0, maxY > 0 ? (p.y / maxY) * 5 : 0, maxZ > 0 ? (p.z / maxZ) * 5 : 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={new THREE.Color(`hsl(${(i / points.length) * 360}, 100%, 50%)`)} /></mesh>)}</>);
};

// --- 3D Bar Chart Component ---
const Chart3DBar = ({ data, xAxis, yAxis }) => {
    const bars = useMemo(() => data.map(d => ({ xLabel: d[xAxis], yValue: parseFloat(d[yAxis]) })).filter(b => b.xLabel && !isNaN(b.yValue)), [data, xAxis, yAxis]);
    const maxY = useMemo(() => Math.max(...bars.map(b => b.yValue)), [bars]);
    if (bars.length === 0) return <Text>No valid data for a 3D bar chart.</Text>;
    return (<>{bars.map((bar, i) => <mesh key={i} position={[(i - bars.length / 2) * 1.5, (maxY > 0 ? (bar.yValue / maxY) * 8 : 0) / 2, 0]}><boxGeometry args={[1, maxY > 0 ? (bar.yValue / maxY) * 8 : 0, 1]} /><meshStandardMaterial color={new THREE.Color(`hsl(${(i / bars.length) * 360}, 100%, 50%)`)} /></mesh>)}</>);
};


const Visualizations = () => {
    const [fileName, setFileName] = useState('');
    const [columns, setColumns] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [zAxis, setZAxis] = useState('');
    const [dimension, setDimension] = useState('2D');
    const [chartType, setChartType] = useState('Bar Chart');
    const [captureRequest, setCaptureRequest] = useState(null);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: 'Hello! How can I help you analyze this data?' }]);
    const [userInput, setUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    
    const chartRef = useRef(null);
    const chatEndRef = useRef(null);
    
    const { fetchStats } = useDashboard();
    const location = useLocation();

    const handleLoadFile = async (file) => {
        try {
            setFileName(file.originalName);
            const res = await axios.get(`http://localhost:5001/${file.path}`, { responseType: 'arraybuffer' });
            const data = new Uint8Array(res.data);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            if (jsonData.length > 0) {
                setColumns(Object.keys(jsonData[0]));
                setChartData(jsonData);
            }
        } catch (err) {
            alert("Could not load file data.");
        }
    };

    useEffect(() => {
        if (location.state?.fileToLoad) {
            handleLoadFile(location.state.fileToLoad);
        }
    }, [location.state]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                if (jsonData.length > 0) {
                    setFileName(file.name);
                    setColumns(Object.keys(jsonData[0]));
                    setChartData(jsonData);
                }
            } catch (error) {
                alert("There was an error processing this file.");
            }
        };
        reader.readAsArrayBuffer(file);

        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
            });
            fetchStats();
        } catch (err) {
            console.error("File upload failed.", err);
        }
    };

    const handleDimensionChange = (e) => {
        const newDimension = e.target.value;
        setDimension(newDimension);
        setChartType(newDimension === '2D' ? chartOptions2D[0] : chartOptions3D[0]);
    };

    const handleDownload = (format) => {
        const downloadFileName = `${fileName.split('.')[0] || 'chart'}-${chartType}.${format}`;
        const processAndDownload = (image) => {
            if (format === 'pdf') {
                const pdf = new jsPDF();
                const imgProps= pdf.getImageProperties(image);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(image, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(downloadFileName);
            } else {
                const link = document.createElement('a');
                link.href = image;
                link.download = downloadFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        if (dimension === '2D') {
            const chartInstance = chartRef.current;
            if (!chartInstance) return alert('Chart not available for download.');
            processAndDownload(chartInstance.toBase64Image());
        } else {
            setCaptureRequest({
                format: format === 'pdf' ? 'png' : format,
                callback: (image) => {
                    processAndDownload(image);
                    setCaptureRequest(null);
                }
            });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || !chartData) return;

        const newMessages = [...chatMessages, { sender: 'user', text: userInput }];
        setChatMessages(newMessages);
        const currentInput = userInput;
        setUserInput('');
        setIsAiThinking(true);

        try {
            const dataSummary = chartData.slice(0, 10).map(row => JSON.stringify(row)).join('\n');
            const prompt = `You are a data analysis assistant. Based on the following data summary, please answer the user's question.\n\nData Sample:\n${dataSummary}\n\nQuestion: ${currentInput}`;
            
            const payload = {
                contents: [{
                    parts: [{ "text": prompt }]
                }]
            };
            
            const apiKey = "AIzaSyC9r2ngx5tbX0HCxKvOwekA2ueQOTPnN5g"; // This will be handled by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            const aiResponse = result.candidates[0].content.parts[0].text;
            
            setChatMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error("AI request failed:", error);
            setChatMessages([...newMessages, { sender: 'ai', text: "Sorry, I couldn't process that request. Please try again." }]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const memoized2DChartData = useMemo(() => {
        if (!chartData || !xAxis || !yAxis) return null;
        const backgroundColors = ['rgba(79, 70, 229, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'];
        return {
            labels: chartData.map(item => item[xAxis]),
            datasets: [{ label: yAxis, data: chartData.map(item => item[yAxis]), backgroundColor: backgroundColors, borderColor: backgroundColors.map(c => c.replace('0.6', '1')), borderWidth: 1, }]
        };
    }, [chartData, xAxis, yAxis]);

    const getChart2DOptions = (type) => {
        const isPieType = singleAxisCharts.includes(type);
        return {
            responsive: true,
            maintainAspectRatio: !isPieType,
            plugins: {
                zoom: {
                    pan: { enabled: !isPieType, mode: 'xy' },
                    zoom: { wheel: { enabled: !isPieType }, pinch: { enabled: !isPieType }, mode: 'xy' }
                }
            }
        };
    };

    const showInitialPlaceholder = !chartData;
    const show2DAxesPlaceholder = dimension === '2D' && (!xAxis || !yAxis);
    const show3DAxesPlaceholder = dimension === '3D' && (!xAxis || !yAxis || !zAxis);

    return (
        <div className={styles.container}>
            <div className={styles.controlsPanel}>
                <h2 className={styles.title}>Visualizations</h2>
                <div className={styles.controlSection}>
                    <label htmlFor="file-upload" className={styles.uploadLabel}>{fileName || 'Upload New File'}</label>
                    <input id="file-upload" type="file" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
                </div>
                <div className={styles.controlSection}>
                    <h3 className={styles.controlTitle}>Graph Dimension</h3>
                    <select className={styles.select} value={dimension} onChange={handleDimensionChange}><option value="2D">2D</option><option value="3D">3D</option></select>
                </div>
                <div className={styles.controlSection}>
                    <h3 className={styles.controlTitle}>Graph Type</h3>
                    <select className={styles.select} value={chartType} onChange={e => setChartType(e.target.value)}>{(dimension === '2D' ? chartOptions2D : chartOptions3D).map(type => (<option key={type} value={type}>{type}</option>))}</select>
                </div>
                <div className={styles.controlSection}>
                    <h3 className={styles.controlTitle}>Axes</h3>
                    <label>X-Axis / Labels</label>
                    <select className={styles.select} value={xAxis} onChange={e => setXAxis(e.target.value)} disabled={!columns.length}><option value="">Select Column</option>{columns.map(col => <option key={col} value={col}>{col}</option>)}</select>
                    <label>Y-Axis / Values</label>
                    <select className={styles.select} value={yAxis} onChange={e => setYAxis(e.target.value)} disabled={!columns.length}><option value="">Select Column</option>{columns.map(col => <option key={col} value={col}>{col}</option>)}</select>
                    {dimension === '3D' && (<><label>Z-Axis / Depth</label><select className={styles.select} value={zAxis} onChange={e => setZAxis(e.target.value)} disabled={!columns.length}><option value="">Select Column</option>{columns.map(col => <option key={col} value={col}>{col}</option>)}</select></>)}
                </div>
                <div className={styles.controlSection}>
                    <h3 className={styles.controlTitle}>Download</h3>
                    <div className={styles.buttonGroup}>
                        <button onClick={() => handleDownload('png')} className={styles.downloadButton}>PNG</button>
                        <button onClick={() => handleDownload('jpeg')} className={styles.downloadButton}>JPEG</button>
                        <button onClick={() => handleDownload('pdf')} className={styles.downloadButton}>PDF</button>
                    </div>
                </div>
            </div>
            <div className={styles.displayPanel}>
                <div className={styles.graphContainer}>
                    <div className={styles.zoomHint}>{chartData && dimension === '2D' && !singleAxisCharts.includes(chartType) ? 'Scroll to Zoom, Drag to Pan' : chartData && dimension === '3D' ? 'Scroll to Zoom, Drag to Rotate' : null}</div>
                    
                    <div className={`${styles.chartWrapper} ${dimension === '2D' && !showInitialPlaceholder && !show2DAxesPlaceholder ? '' : styles.hidden}`}>
                        {memoized2DChartData && (
                            <>
                                {chartType === 'Bar Chart' && <Bar ref={chartRef} data={memoized2DChartData} options={getChart2DOptions('Bar Chart')} />}
                                {chartType === 'Line Chart' && <Line ref={chartRef} data={memoized2DChartData} options={getChart2DOptions('Line Chart')} />}
                                {chartType === 'Pie Chart' && <div className={styles.pieContainer}><Pie ref={chartRef} data={memoized2DChartData} options={getChart2DOptions('Pie Chart')} /></div>}
                                {chartType === 'Doughnut Chart' && <div className={styles.pieContainer}><Doughnut ref={chartRef} data={memoized2DChartData} options={getChart2DOptions('Doughnut Chart')} /></div>}
                                {chartType === 'Polar Area Chart' && <div className={styles.pieContainer}><PolarArea ref={chartRef} data={memoized2DChartData} options={getChart2DOptions('Polar Area Chart')} /></div>}
                            </>
                        )}
                    </div>

                    <div className={`${styles.chartWrapper} ${dimension === '3D' && !showInitialPlaceholder && !show3DAxesPlaceholder ? '' : styles.hidden}`}>
                        <Suspense fallback={<div className={styles.placeholder}>Loading 3D View...</div>}>
                            <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [10, 10, 10], fov: 50 }}>
                                <ambientLight intensity={0.8} />
                                <pointLight position={[10, 10, 10]} intensity={1} />
                                {chartType === '3D Scatter Plot' && <Chart3DScatter data={chartData} xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} />}
                                {chartType === '3D Bar Chart' && <Chart3DBar data={chartData} xAxis={xAxis} yAxis={yAxis} />}
                                <axesHelper args={[6]} />
                                <gridHelper args={[12, 12]} />
                                <OrbitControls />
                                <SceneCapturer onCaptureTrigger={captureRequest} />
                            </Canvas>
                        </Suspense>
                    </div>

                    {showInitialPlaceholder && <div className={styles.placeholder}><p>Please upload a file to begin.</p></div>}
                    {chartData && show2DAxesPlaceholder && <div className={styles.placeholder}><p>Select X and Y axes to display a chart.</p></div>}
                    {chartData && show3DAxesPlaceholder && <div className={styles.placeholder}><p>Select X, Y, and Z axes for the 3D plot.</p></div>}
                </div>
                <div className={styles.reportContainer}>
                    <h3 className={styles.reportTitle}>Data Report</h3>
                    <div className={styles.tableContainer}>
                        {chartData ? (<table className={styles.reportTable}><thead><tr>{columns.map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{chartData.map((row, rowIndex) => (<tr key={rowIndex}>{columns.map(col => <td key={col}>{row[col]}</td>)}</tr>))}</tbody></table>) : (<p>The contents of your uploaded file will be shown here.</p>)}
                    </div>
                </div>
                
                <div className={`${styles.aiChatWindow} ${isAiChatOpen ? styles.open : ''}`}>
                    <div className={styles.chatHeader}>
                        <h3>AI Assistant</h3>
                        <button onClick={() => setIsAiChatOpen(false)}>&times;</button>
                    </div>
                    <div className={styles.chatMessages}>
                        {chatMessages.map((msg, index) => (<div key={index} className={`${styles.message} ${styles[msg.sender + 'Message']}`}>{msg.text}</div>))}
                        {isAiThinking && <div className={`${styles.message} ${styles.aiMessage}`}>Thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                        <input 
                            type="text" 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask about the data..."
                            disabled={!chartData || isAiThinking}
                        />
                        <button type="submit" disabled={!chartData || isAiThinking}>Send</button>
                    </form>
                </div>

                <button onClick={() => setIsAiChatOpen(true)} className={styles.aiAssistantButton}>
                    <span role="img" aria-label="AI Assistant">🤖</span> Ask AI
                </button>
            </div>
        </div>
    );
};

export default Visualizations;
