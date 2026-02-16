// document.addEventListener('DOMContentLoaded', () => {
//     // التحقق من وجود Fabric
//     if (typeof fabric === 'undefined') {
//         alert('خطأ: مكتبة Fabric غير محملة. تأكد من وجود fabric.min.js في المجلد.');
//         return;
//     }

//     // -------------------- عناصر DOM --------------------
//     const canvasEl = document.getElementById('canvas');
//     const uploadInput = document.getElementById('upload');
//     const previewBtn = document.getElementById('previewBtn');
//     const framesContainer = document.getElementById('framesContainer');
//     const zoomInBtn = document.getElementById('zoomInBtn');
//     const zoomOutBtn = document.getElementById('zoomOutBtn');
//     const rotateLeftBtn = document.getElementById('rotateLeftBtn');
//     const rotateRightBtn = document.getElementById('rotateRightBtn');
//     const resetBtn = document.getElementById('resetBtn');
//     const downloadBtn = document.getElementById('downloadBtn');
//     const loader = document.getElementById('loader');
//     const addNameBtn = document.getElementById('addNameBtn');
//     const usernameInput = document.getElementById('username');
//     const fontSizeInput = document.getElementById('fontSize');
//     const fontSizeVal = document.getElementById('fontSizeVal');
//     const fontColorInput = document.getElementById('fontColor');
//     const fontFamilySelect = document.getElementById('fontFamily');
//     const textBgColor = document.getElementById('textBgColor');
//     const textOpacity = document.getElementById('textOpacity');
//     const textBold = document.getElementById('textBold');
//     const textItalic = document.getElementById('textItalic');
//     const textUnderline = document.getElementById('textUnderline');
//     const updateTextBtn = document.getElementById('updateTextBtn');
//     const deleteTextBtn = document.getElementById('deleteTextBtn');
//     const textOptions = document.getElementById('textOptions');

//     // -------------------- إعداد الكانفاس --------------------
//     const canvas = new fabric.Canvas('canvas', {
//         preserveObjectStacking: true,
//         selection: true,
//         backgroundColor: 'white'
//     });
//     const CANVAS_SIZE = { w: canvas.width, h: canvas.height }; // 600x600
//     const centerX = CANVAS_SIZE.w / 2;
//     const centerY = CANVAS_SIZE.h / 2;

//     // -------------------- المتغيرات العامة --------------------
//     let userImage = null;          // صورة المستخدم (fabric.Image)
//     let frameImage = null;         // الإطار المحدد (fabric.Image)
//     let selectedFrameSrc = null;   // رابط الإطار المحدد
//     let originalImageScale = 1;    // المقياس الأصلي للصورة
//     let activeText = null;         // النص المحدد حالياً (للتحديث)

//     // -------------------- قائمة الإطارات (عدّل المسار حسب مجلدك) --------------------
//     const framesList = [
//         'frames/frame1.png',
//         'frames/frame2.png',
//         'frames/frame3.png',
//         'frames/frame4.png',
//         // أضف المزيد...
//     ];

//     // -------------------- دوال مساعدة --------------------
//     function showLoader() { loader.classList.remove('hidden'); }
//     function hideLoader() { loader.classList.add('hidden'); }

//     function showToast(msg, type = 'info', timeout = 2500) {
//         const toast = document.createElement('div');
//         toast.className = 'toast';
//         // أيقونة حسب النوع
//         let icon = 'ℹ️';
//         if (type === 'success') icon = '✅';
//         else if (type === 'error') icon = '❌';
//         else if (type === 'warning') icon = '⚠️';
//         toast.innerHTML = `${icon} ${msg}`;
//         document.body.appendChild(toast);
//         setTimeout(() => toast.remove(), timeout);
//     }

//     // -------------------- تحميل وعرض الإطارات --------------------
//     framesList.forEach(src => {
//         const img = document.createElement('img');
//         img.src = src;
//         img.alt = 'إطار';
//         img.loading = 'lazy';
//         img.onerror = () => {
//             img.style.opacity = 0.3;
//             img.title = 'فشل تحميل الإطار';
//         };
//         img.addEventListener('click', () => {
//             document.querySelectorAll('.frames img').forEach(i => i.classList.remove('selected'));
//             img.classList.add('selected');
//             selectedFrameSrc = src;
//             if (userImage) loadFrame(); // تحميل الإطار فوراً إذا كانت الصورة موجودة
//         });
//         framesContainer.appendChild(img);
//     });

//     // -------------------- رفع الصورة --------------------
//     uploadInput.addEventListener('change', (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         if (!file.type.startsWith('image/')) {
//             showToast('الرجاء اختيار ملف صورة', 'error');
//             return;
//         }
//         const reader = new FileReader();
//         reader.onload = (ev) => {
//             // تخزين dataURL مؤقتاً للاستخدام عند الضغط على "تطبيق الصورة"
//             window.uploadedImageData = ev.target.result;
//             showToast('تم رفع الصورة، اضغط "تطبيق الصورة"', 'success');
//         };
//         reader.readAsDataURL(file);
//     });

//     // -------------------- إنشاء صورة المستخدم --------------------
//     function createUserImage(callback) {
//         if (!window.uploadedImageData) {
//             showToast('لم ترفع صورة بعد', 'warning');
//             return;
//         }

//         showLoader();
//         const imgEl = new Image();
//         imgEl.crossOrigin = 'anonymous';
//         imgEl.onload = () => {
//             try {
//                 // إنشاء كائن Fabric Image
//                 const fimg = new fabric.Image(imgEl, {
//                     left: centerX,
//                     top: centerY,
//                     originX: 'center',
//                     originY: 'center',
//                     selectable: true,
//                     hasBorders: true,
//                     hasControls: true,
//                     cornerColor: '#667eea',
//                     cornerSize: 10,
//                     transparentCorners: false,
//                     borderColor: '#667eea'
//                 });

//                 // حساب المقياس لتناسب الدائرة (أو أي حجم مرغوب)
//                 const scale = Math.max(
//                     (CANVAS_SIZE.w * 0.8) / imgEl.width,
//                     (CANVAS_SIZE.h * 0.8) / imgEl.height
//                 );
//                 fimg.scale(scale);
//                 originalImageScale = scale;

//                 // قفل التدوير مؤقتاً (يمكن فتحه لاحقاً)
//                 // fimg.lockRotation = true;

//                 // إزالة الصورة القديمة إن وجدت
//                 if (userImage) canvas.remove(userImage);
//                 userImage = fimg;
//                 canvas.add(userImage);
//                 canvas.setActiveObject(userImage);

//                 // تنفيذ callback (مثل تحميل الإطار)
//                 if (typeof callback === 'function') callback();

//                 // تحديث عرض خيارات النص (لأن الصورة أصبحت موجودة)
//                 textOptions.style.display = 'block';
//             } catch (err) {
//                 console.error(err);
//                 showToast('حدث خطأ أثناء تجهيز الصورة', 'error');
//             } finally {
//                 hideLoader();
//                 canvas.renderAll();
//             }
//         };
//         imgEl.onerror = () => {
//             hideLoader();
//             showToast('فشل تحميل الصورة', 'error');
//         };
//         imgEl.src = window.uploadedImageData;
//     }

//     // -------------------- تحميل الإطار --------------------
//     function loadFrame() {
//         if (!selectedFrameSrc) {
//             showToast('اختر إطاراً أولاً', 'warning');
//             return;
//         }
//         showLoader();
//         fabric.Image.fromURL(selectedFrameSrc, (img) => {
//             try {
//                 if (frameImage) canvas.remove(frameImage);
//                 img.set({
//                     left: 0,
//                     top: 0,
//                     originX: 'left',
//                     originY: 'top',
//                     selectable: false,
//                     evented: false,
//                     hasControls: false,
//                     hasBorders: false
//                 });
//                 img.scaleToWidth(CANVAS_SIZE.w);
//                 img.scaleToHeight(CANVAS_SIZE.h);
//                 frameImage = img;
//                 canvas.add(frameImage);
//                 // نضمن الإطار في المقدمة (لأنه شفاف عادة)
//                 canvas.bringToFront(frameImage);
//                 canvas.renderAll();
//             } catch (err) {
//                 console.error(err);
//                 showToast('فشل تحميل الإطار', 'error');
//             } finally {
//                 hideLoader();
//             }
//         });
//     }

//     // -------------------- زر المعاينة --------------------
//     previewBtn.addEventListener('click', () => {
//         if (!window.uploadedImageData) {
//             showToast('ارفع صورة أولاً', 'warning');
//             return;
//         }
//         // إعادة تعيين الكانفاس (مع الاحتفاظ بالإطار لاحقاً)
//         canvas.clear();
//         userImage = null;
//         frameImage = null;
//         createUserImage(() => {
//             if (selectedFrameSrc) loadFrame();
//         });
//     });

//     // -------------------- أدوات تحكم الصورة --------------------
//     zoomInBtn.addEventListener('click', () => {
//         if (!userImage) return;
//         userImage.scale(userImage.scaleX + 0.1);
//         canvas.renderAll();
//     });

//     zoomOutBtn.addEventListener('click', () => {
//         if (!userImage || userImage.scaleX <= 0.2) return;
//         userImage.scale(userImage.scaleX - 0.1);
//         canvas.renderAll();
//     });

//     rotateLeftBtn.addEventListener('click', () => {
//         if (!userImage) return;
//         userImage.rotate((userImage.angle || 0) - 15);
//         canvas.renderAll();
//     });

//     rotateRightBtn.addEventListener('click', () => {
//         if (!userImage) return;
//         userImage.rotate((userImage.angle || 0) + 15);
//         canvas.renderAll();
//     });

//     resetBtn.addEventListener('click', () => {
//         if (!userImage) return;
//         userImage.set({
//             left: centerX,
//             top: centerY,
//             angle: 0,
//             scaleX: originalImageScale,
//             scaleY: originalImageScale
//         });
//         canvas.renderAll();
//     });

//     // -------------------- إدارة النصوص --------------------
//     // تحديث قيمة عرض الحجم
//     fontSizeInput.addEventListener('input', () => {
//         fontSizeVal.textContent = fontSizeInput.value;
//     });

//     // إضافة نص جديد
//     addNameBtn.addEventListener('click', () => {
//         if (!userImage) {
//             showToast('أضف الصورة أولاً', 'warning');
//             return;
//         }
//         const text = usernameInput.value.trim();
//         if (!text) {
//             showToast('اكتب النص المطلوب', 'warning');
//             return;
//         }

//         // إنشاء كائن نص
//         const fabricText = new fabric.Text(text, {
//             left: centerX,
//             top: centerY,
//             originX: 'center',
//             originY: 'center',
//             fontFamily: fontFamilySelect.value,
//             fontSize: parseInt(fontSizeInput.value),
//             fill: fontColorInput.value,
//             backgroundColor: textBgColor.value,
//             opacity: parseFloat(textOpacity.value),
//             fontWeight: textBold.checked ? 'bold' : 'normal',
//             fontStyle: textItalic.checked ? 'italic' : 'normal',
//             underline: textUnderline.checked,
//             selectable: true,
//             hasControls: true,
//             hasBorders: true,
//             cornerColor: '#667eea',
//             cornerSize: 8
//         });

//         canvas.add(fabricText);
//         canvas.setActiveObject(fabricText);
//         canvas.renderAll();
//         showToast('تمت إضافة النص', 'success');
//     });

//     // عند تحديد كائن على الكانفاس (نص أو صورة)
//     canvas.on('selection:created', (e) => {
//         const obj = e.selected[0];
//         if (obj && obj.type === 'text') {
//             activeText = obj;
//             // تحديث واجهة التحكم بقيم النص المحدد
//             usernameInput.value = obj.text;
//             fontFamilySelect.value = obj.fontFamily;
//             fontSizeInput.value = obj.fontSize;
//             fontSizeVal.textContent = obj.fontSize;
//             fontColorInput.value = obj.fill;
//             textBgColor.value = obj.backgroundColor || '#000000';
//             textOpacity.value = obj.opacity;
//             textBold.checked = obj.fontWeight === 'bold';
//             textItalic.checked = obj.fontStyle === 'italic';
//             textUnderline.checked = obj.underline;
//         }
//     });

//     canvas.on('selection:updated', (e) => {
//         const obj = e.selected[0];
//         if (obj && obj.type === 'text') {
//             activeText = obj;
//             // نفس التحديث
//             usernameInput.value = obj.text;
//             fontFamilySelect.value = obj.fontFamily;
//             fontSizeInput.value = obj.fontSize;
//             fontSizeVal.textContent = obj.fontSize;
//             fontColorInput.value = obj.fill;
//             textBgColor.value = obj.backgroundColor || '#000000';
//             textOpacity.value = obj.opacity;
//             textBold.checked = obj.fontWeight === 'bold';
//             textItalic.checked = obj.fontStyle === 'italic';
//             textUnderline.checked = obj.underline;
//         }
//     });

//     canvas.on('selection:cleared', () => {
//         activeText = null;
//         // لا نقوم بمسح الحقول تلقائياً، يمكن تركها كما هي.
//     });

//     // تحديث النص المحدد
//     updateTextBtn.addEventListener('click', () => {
//         if (!activeText) {
//             showToast('حدد النص المطلوب تحديثه', 'warning');
//             return;
//         }
//         activeText.set({
//             text: usernameInput.value,
//             fontFamily: fontFamilySelect.value,
//             fontSize: parseInt(fontSizeInput.value),
//             fill: fontColorInput.value,
//             backgroundColor: textBgColor.value,
//             opacity: parseFloat(textOpacity.value),
//             fontWeight: textBold.checked ? 'bold' : 'normal',
//             fontStyle: textItalic.checked ? 'italic' : 'normal',
//             underline: textUnderline.checked
//         });
//         canvas.renderAll();
//         showToast('تم تحديث النص', 'success');
//     });

//     // حذف النص المحدد
//     deleteTextBtn.addEventListener('click', () => {
//         if (!activeText) {
//             showToast('حدد النص المطلوب حذفه', 'warning');
//             return;
//         }
//         canvas.remove(activeText);
//         activeText = null;
//         canvas.renderAll();
//         showToast('تم حذف النص', 'success');
//     });

//     // -------------------- تحميل الصورة النهائية --------------------
//     downloadBtn.addEventListener('click', () => {
//         if (!userImage) {
//             showToast('لا توجد صورة لتحميلها', 'warning');
//             return;
//         }
//         // إزالة التحديدات
//         canvas.discardActiveObject();
//         canvas.renderAll();

//         // توليد رابط بصيغة PNG بدقة مضاعفة
//         const dataURL = canvas.toDataURL({
//             format: 'png',
//             quality: 1,
//             multiplier: 2
//         });
//         const link = document.createElement('a');
//         link.href = dataURL;
//         link.download = 'my-frame-image.png';
//         link.click();
//         showToast('تم بدء التحميل', 'success');
//     });

//     // -------------------- تحسينات إضافية --------------------
//     // منع تداخل الإطار مع السحب
//     canvas.on('object:moving', (e) => {
//         const obj = e.target;
//         if (obj === frameImage) {
//             // لا نسمح بتحريك الإطار
//             return false;
//         }
//     });

//     // رسالة ترحيب
//     showToast('مرحباً بك في منصة تركيب الإطارات', 'info');
// });
document.addEventListener('DOMContentLoaded', () => {
    if (typeof fabric === 'undefined') {
        alert('خطأ: مكتبة Fabric غير محملة.');
        return;
    }

    // -------------------- عناصر DOM --------------------
    const canvasEl = document.getElementById('canvas');
    const uploadInput = document.getElementById('upload');
    const previewBtn = document.getElementById('previewBtn');
    const framesContainer = document.getElementById('framesContainer');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loader = document.getElementById('loader');
    const addNameBtn = document.getElementById('addNameBtn');
    const usernameInput = document.getElementById('username');
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeVal = document.getElementById('fontSizeVal');
    const fontColorInput = document.getElementById('fontColor');
    const fontFamilySelect = document.getElementById('fontFamily');
    const textBgColor = document.getElementById('textBgColor');
    const textOpacity = document.getElementById('textOpacity');
    const textBold = document.getElementById('textBold');
    const textItalic = document.getElementById('textItalic');
    const textUnderline = document.getElementById('textUnderline');
    const updateTextBtn = document.getElementById('updateTextBtn');
    const deleteTextBtn = document.getElementById('deleteTextBtn');
    const textOptions = document.getElementById('textOptions');

    // -------------------- إعداد الكانفاس --------------------
    const canvas = new fabric.Canvas('canvas', {
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: 'white'
    });
    const CANVAS_SIZE = { w: canvas.width, h: canvas.height };
    const centerX = CANVAS_SIZE.w / 2;
    const centerY = CANVAS_SIZE.h / 2;

    // -------------------- المتغيرات العامة --------------------
    let userImage = null;
    let frameImage = null;
    let selectedFrameSrc = null;
    let originalImageScale = 1;
    let activeText = null;

    // -------------------- قائمة الإطارات --------------------
    const framesList = [
        'frames/frame1.png',
        'frames/frame2.png',
        'frames/frame3.png',
        // أضف المزيد...
    ];

    // -------------------- دوال مساعدة --------------------
    // في أي دالة تبدأ التحميل، نخفي loader أولاً ثم نظهره
    function showLoader() { 
        loader.classList.remove('hidden'); 
    }
    function hideLoader() { 
        loader.classList.add('hidden'); 
    }
    // وأيضاً في حالة الخطأ العام
    window.addEventListener('error', () => hideLoader());
    function showToast(msg, type = 'info', timeout = 2500) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        else if (type === 'error') icon = '❌';
        else if (type === 'warning') icon = '⚠️';
        toast.innerHTML = `${icon} ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), timeout);
    }

    // -------------------- تحميل وعرض الإطارات --------------------
    framesList.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'إطار';
        img.loading = 'lazy';
        img.onerror = () => {
            img.style.opacity = 0.3;
            img.title = 'فشل تحميل الإطار';
        };
        img.addEventListener('click', () => {
            document.querySelectorAll('.frames img').forEach(i => i.classList.remove('selected'));
            img.classList.add('selected');
            selectedFrameSrc = src;
            if (userImage) loadFrame();
        });
        framesContainer.appendChild(img);
    });

    // -------------------- رفع الصورة --------------------
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('الرجاء اختيار ملف صورة', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            window.uploadedImageData = ev.target.result;
            showToast('تم رفع الصورة، اضغط "تطبيق الصورة"', 'success');
        };
        reader.readAsDataURL(file);
    });

    // -------------------- إنشاء صورة المستخدم --------------------
    function createUserImage(callback) {
        if (!window.uploadedImageData) {
            showToast('لم ترفع صورة بعد', 'warning');
            return;
        }

        showLoader();
        const imgEl = new Image();
        imgEl.crossOrigin = 'anonymous';
        imgEl.onload = () => {
            try {
                const fimg = new fabric.Image(imgEl, {
                    left: centerX,
                    top: centerY,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    hasBorders: true,
                    hasControls: true,
                    cornerColor: '#667eea',
                    cornerSize: 10,
                    transparentCorners: false,
                    borderColor: '#667eea'
                });

                const scale = Math.max(
                    (CANVAS_SIZE.w * 0.8) / imgEl.width,
                    (CANVAS_SIZE.h * 0.8) / imgEl.height
                );
                fimg.scale(scale);
                originalImageScale = scale;

                if (userImage) canvas.remove(userImage);
                userImage = fimg;
                canvas.add(userImage);
                canvas.setActiveObject(userImage);

                if (typeof callback === 'function') callback();

                textOptions.style.display = 'block';
            } catch (err) {
                console.error(err);
                showToast('حدث خطأ أثناء تجهيز الصورة', 'error');
            } finally {
                hideLoader(); // تأكيد إخفاء loader حتى في حالة الخطأ
                canvas.renderAll();
            }
        };
        imgEl.onerror = () => {
            hideLoader();
            showToast('فشل تحميل الصورة', 'error');
        };
        imgEl.src = window.uploadedImageData;
    }

    // -------------------- تحميل الإطار --------------------
    function loadFrame() {
        if (!selectedFrameSrc) {
            showToast('اختر إطاراً أولاً', 'warning');
            return;
        }
        showLoader();
        fabric.Image.fromURL(selectedFrameSrc, (img) => {
            try {
                if (frameImage) canvas.remove(frameImage);
                img.set({
                    left: 0,
                    top: 0,
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    evented: false,
                    hasControls: false,
                    hasBorders: false
                });
                img.scaleToWidth(CANVAS_SIZE.w);
                img.scaleToHeight(CANVAS_SIZE.h);
                frameImage = img;
                canvas.add(frameImage);
                canvas.bringToFront(frameImage); // الإطار في المقدمة (لأنه شفاف)
                canvas.renderAll();
            } catch (err) {
                console.error(err);
                showToast('فشل تحميل الإطار', 'error');
            } finally {
                hideLoader(); // تأكيد الإخفاء
            }
        });
    }

    // -------------------- زر المعاينة --------------------
    previewBtn.addEventListener('click', () => {
        if (!window.uploadedImageData) {
            showToast('ارفع صورة أولاً', 'warning');
            return;
        }
        canvas.clear();
        userImage = null;
        frameImage = null;
        createUserImage(() => {
            if (selectedFrameSrc) loadFrame();
        });
    });

    // -------------------- أدوات تحكم الصورة --------------------
    zoomInBtn.addEventListener('click', () => {
        if (!userImage) return;
        userImage.scale(userImage.scaleX + 0.1);
        canvas.renderAll();
    });

    zoomOutBtn.addEventListener('click', () => {
        if (!userImage || userImage.scaleX <= 0.2) return;
        userImage.scale(userImage.scaleX - 0.1);
        canvas.renderAll();
    });

    rotateLeftBtn.addEventListener('click', () => {
        if (!userImage) return;
        userImage.rotate((userImage.angle || 0) - 15);
        canvas.renderAll();
    });

    rotateRightBtn.addEventListener('click', () => {
        if (!userImage) return;
        userImage.rotate((userImage.angle || 0) + 15);
        canvas.renderAll();
    });

    resetBtn.addEventListener('click', () => {
        if (!userImage) return;
        userImage.set({
            left: centerX,
            top: centerY,
            angle: 0,
            scaleX: originalImageScale,
            scaleY: originalImageScale
        });
        canvas.renderAll();
    });

    // -------------------- إدارة النصوص --------------------
    fontSizeInput.addEventListener('input', () => {
        fontSizeVal.textContent = fontSizeInput.value;
    });

    addNameBtn.addEventListener('click', () => {
        if (!userImage) {
            showToast('أضف الصورة أولاً', 'warning');
            return;
        }
        const text = usernameInput.value.trim();
        if (!text) {
            showToast('اكتب النص المطلوب', 'warning');
            return;
        }

        const fabricText = new fabric.Text(text, {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: fontFamilySelect.value,
            fontSize: parseInt(fontSizeInput.value),
            fill: fontColorInput.value,
            backgroundColor: textBgColor.value,
            opacity: parseFloat(textOpacity.value),
            fontWeight: textBold.checked ? 'bold' : 'normal',
            fontStyle: textItalic.checked ? 'italic' : 'normal',
            underline: textUnderline.checked,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#667eea',
            cornerSize: 8
        });

        canvas.add(fabricText);
        canvas.setActiveObject(fabricText);
        canvas.renderAll();
        showToast('تمت إضافة النص', 'success');
    });

    canvas.on('selection:created', (e) => {
        const obj = e.selected[0];
        if (obj && obj.type === 'text') {
            activeText = obj;
            usernameInput.value = obj.text;
            fontFamilySelect.value = obj.fontFamily;
            fontSizeInput.value = obj.fontSize;
            fontSizeVal.textContent = obj.fontSize;
            fontColorInput.value = obj.fill;
            textBgColor.value = obj.backgroundColor || '#000000';
            textOpacity.value = obj.opacity;
            textBold.checked = obj.fontWeight === 'bold';
            textItalic.checked = obj.fontStyle === 'italic';
            textUnderline.checked = obj.underline;
        }
    });

    canvas.on('selection:updated', (e) => {
        const obj = e.selected[0];
        if (obj && obj.type === 'text') {
            activeText = obj;
            // نفس التحديث
            usernameInput.value = obj.text;
            fontFamilySelect.value = obj.fontFamily;
            fontSizeInput.value = obj.fontSize;
            fontSizeVal.textContent = obj.fontSize;
            fontColorInput.value = obj.fill;
            textBgColor.value = obj.backgroundColor || '#000000';
            textOpacity.value = obj.opacity;
            textBold.checked = obj.fontWeight === 'bold';
            textItalic.checked = obj.fontStyle === 'italic';
            textUnderline.checked = obj.underline;
        }
    });

    canvas.on('selection:cleared', () => {
        activeText = null;
    });

    updateTextBtn.addEventListener('click', () => {
        if (!activeText) {
            showToast('حدد النص المطلوب تحديثه', 'warning');
            return;
        }
        activeText.set({
            text: usernameInput.value,
            fontFamily: fontFamilySelect.value,
            fontSize: parseInt(fontSizeInput.value),
            fill: fontColorInput.value,
            backgroundColor: textBgColor.value,
            opacity: parseFloat(textOpacity.value),
            fontWeight: textBold.checked ? 'bold' : 'normal',
            fontStyle: textItalic.checked ? 'italic' : 'normal',
            underline: textUnderline.checked
        });
        canvas.renderAll();
        showToast('تم تحديث النص', 'success');
    });

    deleteTextBtn.addEventListener('click', () => {
        if (!activeText) {
            showToast('حدد النص المطلوب حذفه', 'warning');
            return;
        }
        canvas.remove(activeText);
        activeText = null;
        canvas.renderAll();
        showToast('تم حذف النص', 'success');
    });

    // -------------------- تحميل الصورة --------------------
    downloadBtn.addEventListener('click', () => {
        if (!userImage) {
            showToast('لا توجد صورة لتحميلها', 'warning');
            return;
        }
        canvas.discardActiveObject();
        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'my-frame-image.png';
        link.click();
        showToast('تم بدء التحميل', 'success');
    });

    // -------------------- التأكد من إخفاء loader عند أي خطأ غير متوقع --------------------
    window.addEventListener('error', (e) => {
        hideLoader();
    });

    // رسالة ترحيب
    showToast('رمضان كريم', 'info');

});
