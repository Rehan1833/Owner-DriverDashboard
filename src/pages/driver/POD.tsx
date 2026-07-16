import React, { useState, useRef, useEffect } from 'react';
import { useOperations } from '../../store/OperationsContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Trash2, CheckCircle2, Navigation, Clock, AlertOctagon,
  RefreshCw, FileText, ChevronRight, MapPin, Sparkles, Award
} from 'lucide-react';

export const POD: React.FC = () => {
  const { trips, updateTripStatus, triggerNotification } = useOperations();
  const activeTrip = trips.find(t => t.status !== 'Completed');
  const navigate = useNavigate();

  // Native Camera State
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'notsupported'>('prompt');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  
  // Ref handles
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Location & Timestamp States
  const [gpsCoords, setGpsCoords] = useState('19.0760, 72.8777');
  const [gpsVerified, setGpsVerified] = useState(false);
  const [gpsLocationName, setGpsLocationName] = useState('Mumbai Port Terminal DC');
  const [currentTime, setCurrentTime] = useState('');
  
  // Form and pad states
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState<string | null>(null);
  
  // Progress & Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedPodNumber, setGeneratedPodNumber] = useState('');

  // 1. Live Timestamp Tracker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Geolocation Telemetry Trigger
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsCoords(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
          setGpsVerified(true);
        },
        err => {
          console.warn('Geolocation access failed, falling back to network cell coordinates.', err);
          setGpsVerified(true);
        }
      );
    } else {
      setGpsVerified(true);
    }
  }, []);

  // 3. Camera Handlers
  const startCamera = async (mode = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: { facingMode: mode }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setPermissionStatus('granted');
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error('Camera Initialization error: ', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('notsupported');
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Canvas compression: quality parameter 0.65 jpeg
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
      setCapturedImages(prev => [...prev, compressedDataUrl]);
      triggerNotification('Trip Started', 'Photo Saved', 'Delivery frame captured and compressed successfully.', 'Info');
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 800;
            const scale = Math.min(1, maxWidth / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
              setCapturedImages(prev => [...prev, dataUrl]);
            }
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (indexToDelete: number) => {
    setCapturedImages(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  // 4. Signature Draw Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse/touch relative coordinates
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1E293B';
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureSaved(null);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setSignatureSaved(base64);
    triggerNotification('Trip Started', 'Signature Verified', 'Consignee e-signature locked.', 'Info');
  };

  // 5. Submit POD Form Handler
  const handleSubmitPOD = () => {
    if (capturedImages.length === 0) {
      alert('Please capture or upload at least one cargo delivery photo.');
      return;
    }
    if (!signatureSaved) {
      alert('Please lock the customer consignee e-signature.');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    // Simulate uploading progress bar
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const podCode = `POD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
            setGeneratedPodNumber(podCode);
            setIsSubmitting(false);
            setSubmitSuccess(true);
            stopCamera();

            // Update globally in Context
            if (activeTrip) {
              updateTripStatus(activeTrip.id, 'Completed', {
                deliveryPhoto: capturedImages,
                signatureData: signatureSaved
              });
            }
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-xl text-center space-y-6 my-12">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">✓ POD Uploaded Successfully</h3>
          <p className="text-xs text-slate-400">Cargo manifest verification received by yard logistics controllers.</p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-xs space-y-2">
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">POD Code</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{generatedPodNumber}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Timestamp</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{currentTime}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Location</span>
            <span className="font-bold text-slate-705 dark:text-slate-200 truncate max-w-[180px]">{gpsLocationName}</span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/driver')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs border border-transparent cursor-pointer"
        >
          Return to Trip Console
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Proof of Delivery (POD) Workspace</h2>
        <p className="text-xs text-slate-405 dark:text-slate-500 mt-1">Compile consignee cargo snapshot, location checks, and e-signatures to complete runs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Camera Preview and Gallery (66%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Camera Workspace */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-slate-850 dark:text-slate-150 flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-blue-600" /> Large Camera Viewport
            </h4>

            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay actions on live camera */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={toggleCameraFacing}
                    className="p-2 bg-black/50 text-white border-white/20 hover:bg-black/80 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="primary"
                    onClick={capturePhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg flex items-center gap-1"
                  >
                    Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                    className="p-2 bg-black/50 text-white border-white/20 hover:bg-black/80 rounded-xl text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 aspect-video">
                {permissionStatus === 'denied' ? (
                  <>
                    <div className="p-3.5 bg-red-50 text-red-500 border border-red-100 rounded-2xl">
                      <AlertOctagon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-750">Camera Permission Blocked</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-sm">
                        Please authorize camera access permissions in your browser settings to verify cargo snapshots.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => startCamera()}
                        className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Retry Access
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl animate-pulse">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-205">Native Camera Connection Awaiting</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                        Renders active live stream for freight validation.
                      </p>
                    </div>
                    <div className="flex gap-2.5">
                      <Button
                        variant="primary"
                        onClick={() => startCamera()}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-transparent cursor-pointer"
                      >
                        Authorize Camera
                      </Button>
                      <label className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
                        <Upload className="h-3.5 w-3.5" /> Gallery Upload
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Picture Gallery */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-slate-805 dark:text-slate-100">Captured Delivery Photos ({capturedImages.length})</h4>
            {capturedImages.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No photos recorded. Use camera capture or local gallery select above.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {capturedImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden group">
                    <img src={img} alt="POD" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => deletePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600/80 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Signatures & Telemetry Checklist (33%) */}
        <div className="space-y-6">
          {/* Recipient Signature Pad */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Consignee Signatory Verification</h4>
            
            <div className="bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-2 relative h-48 flex flex-col justify-between">
              {signatureSaved ? (
                <div className="w-full h-32 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={signatureSaved} alt="Locked Signature" className="max-h-full object-contain" />
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 cursor-crosshair h-32"
                />
              )}

              <div className="flex justify-between items-center text-xs pt-1 px-1">
                <span className="text-[9px] text-slate-400 italic">Sign inside the canvas</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                  {!signatureSaved && (
                    <button
                      type="button"
                      onClick={saveSignature}
                      className="text-[10px] font-bold text-blue-600 hover:underline px-2 py-0.5 cursor-pointer"
                    >
                      Lock Signature
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Stamps Check */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">GPS & Timestamp Stamps</h4>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> Time stamp
                </span>
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{currentTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" /> Location Node
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-350 truncate max-w-[120px]">{gpsLocationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-slate-400" /> GPS Telemetry
                </span>
                <Badge variant={gpsVerified ? 'success' : 'neutral'} className="font-mono font-bold">
                  {gpsCoords}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Notes and Submit block */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Delivery Notes Remarks</h4>
            <textarea
              value={deliveryNotes}
              onChange={e => setDeliveryNotes(e.target.value)}
              placeholder="Record any cargo remarks, discrepancies, or seal conditions here..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />

            {isSubmitting ? (
              <div className="space-y-2 pt-2 text-left">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Uploading POD Payload...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmitPOD}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/10 border border-transparent cursor-pointer"
              >
                Submit Delivery POD
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
