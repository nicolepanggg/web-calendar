// 切換 calendar-header 背景圖片
        function updateHeaderBackground(bgImage) {
            const header = document.querySelector('.calendar-header');
            let imageUrl = '';
            // 如果是 data URL (上載的檔案)，直接使用；否則從 background 資料夾載入
            if (bgImage.startsWith('data:')) {
                imageUrl = bgImage;
            } else {
                imageUrl = `background/${bgImage}`;
            }
            const backgroundStyle = `url('${imageUrl}'), linear-gradient(135deg, rgba(255, 107, 107, 0.8) 0%, rgba(238, 90, 36, 0.8) 50%, rgba(255, 159, 243, 0.8) 100%)`;
            header.style.background = backgroundStyle;
        }
        // 動態載入資料夾中的圖片
        function loadGalleryImages() {
            const gallery = document.getElementById('imagesGallery');

            // 清空現有圖片，避免重複載入
            gallery.innerHTML = '';

            // 常見的圖片檔案名稱模式
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            const possibleImages = [];

            // 生成可能的圖片檔案名稱
            for (let i = 1; i <= 20; i++) {
                imageExtensions.forEach(ext => {
                    possibleImages.push(`photos/${i}.${ext}`);
                });
            }

            // 常見的檔案名稱模式
            const commonNames = ['image', 'photo', 'pic', 'picture', 'img'];
            commonNames.forEach(name => {
                for (let i = 1; i <= 10; i++) {
                    imageExtensions.forEach(ext => {
                        possibleImages.push(`photos/${name}${i}.${ext}`);
                        possibleImages.push(`photos/${name}_${i}.${ext}`);
                    });
                }
            });

            let loadedCount = 0;
            let delay = 0;

            possibleImages.forEach((imageName, index) => {
                const img = new Image();
                img.onload = function () {
                    // 圖片載入成功，添加到畫廊
                    setTimeout(() => {
                        const galleryImg = document.createElement('img');
                        galleryImg.src = imageName;
                        galleryImg.alt = `圖片 ${loadedCount + 1}`;
                        galleryImg.className = 'gallery-image';
                        galleryImg.style.animationDelay = `${delay}s`;

                        // 點擊圖片時放大顯示（傳入 element 以便可替換）
                        galleryImg.addEventListener('click', function () {
                            showImageModal(galleryImg);
                        });

                        gallery.appendChild(galleryImg);
                        loadedCount++;
                        delay += 0.1;

                        // 當載入了足夠的圖片後，生成日曆
                        /*if (loadedCount >= 3) {
                            setTimeout(() => {
                                generateCalendar();
                            }, 1000);
                        }*/
                    }, index * 50);
                };
                img.onerror = function () {
                    // 圖片載入失敗，忽略
                };
                img.src = imageName;
            });

            // 如果沒有找到任何圖片，顯示預設圖片
            setTimeout(() => {
                if (loadedCount === 0) {
                    const defaultImg = document.createElement('img');
                    defaultImg.src = 'photos/3.png';
                    defaultImg.alt = '預設圖片';
                    defaultImg.className = 'gallery-image';
                    defaultImg.addEventListener('click', function () {
                        showImageModal(defaultImg);
                    });
                    gallery.appendChild(defaultImg);
                }
                // 圖片載入完成後生成日曆
                setTimeout(() => {
                    generateCalendar();
                    // 同步到 gallery 管理器
                    populateGalleryManager();
                }, 500);
            }, 2000);
        }


        // 顯示圖片放大視窗
        function showImageModal(imageOrElement) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                cursor: pointer;
                text-align: center;
                opacity: 0;
                transition: all 0.4s ease;
            `;
            // 支援傳入 element 或 src 字串
            let galleryElement = null;
            let src = '';
            if (imageOrElement && imageOrElement.tagName) {
                galleryElement = imageOrElement;
                src = galleryElement.src;
            } else if (typeof imageOrElement === 'string') {
                src = imageOrElement;
                // 嘗試找到對應的 gallery element
                const gallery = document.getElementById('imagesGallery');
                if (gallery) {
                    galleryElement = Array.from(gallery.querySelectorAll('.gallery-image')).find(i => i.src === src) || null;
                }
            }

            const img = document.createElement('img');
            img.src = src;
            img.style.cssText = `
                max-width: 100%;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                cursor: default;
            `;

            // 創建圖片容器
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                position: relative;
                display: inline-block;
                max-width: 24%;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            `;

            // 創建關閉按鈕
            const closeDiv = document.createElement('div');
            closeDiv.className = 'close';
            closeDiv.innerHTML = 'X';
            closeDiv.style.cssText = `
                position: absolute;
                top: -2.5rem;
                right: -2.5rem;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.9);
                color: #333;
                border-radius: 50%;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                z-index: 1001;
            `;

            // 關閉按鈕懸停效果
            closeDiv.addEventListener('mouseenter', function () {
                this.style.background = 'rgba(255, 255, 255, 1)';
                this.style.transform = 'scale(1.1)';
            });

            closeDiv.addEventListener('mouseleave', function () {
                this.style.background = 'rgba(255, 255, 255, 0.9)';
                this.style.transform = 'scale(1)';
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(closeDiv);
            // 若為可替換的 gallery 圖片，加入替換按鈕
            if (galleryElement) {
                const replaceBtn = document.createElement('button');
                replaceBtn.textContent = '替換圖片';
                replaceBtn.style.cssText = `
                    position: absolute; bottom: -3rem; left: 50%; transform: translateX(-50%);
                    background: #667eea; color: white; border: none; padding: 10px 18px;
                    border-radius: 10px; cursor: pointer; z-index: 1001; font-weight:600;
                `;
                replaceBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = function (ev) {
                        const file = ev.target.files && ev.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                            alert('請上載圖片檔案（jpg/png/gif 等）');
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = function (r) {
                            const dataUrl = r.target.result;
                            // 更新 modal 顯示
                            img.src = dataUrl;
                            // 更新原始 gallery 元素
                            try { galleryElement.src = dataUrl; } catch (err) {}
                            // 重新生成年曆並更新管理面板
                            generateCalendar();
                            populateGalleryManager();
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                });
                imgContainer.appendChild(replaceBtn);
            }
            modal.appendChild(imgContainer);
            document.body.appendChild(modal);

            // 觸發 fadeIn 動畫
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.background = 'rgba(0,0,0,0.8)';
                imgContainer.style.opacity = '1';
                imgContainer.style.transform = 'scale(1)';
            }, 10);

            // 點擊背景關閉
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    // fadeOut 動畫
                    modal.style.opacity = '0';
                    modal.style.background = 'rgba(0,0,0,0)';
                    imgContainer.style.opacity = '0';
                    imgContainer.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        document.body.removeChild(modal);
                    }, 400);
                }
            });

            // 點擊關閉按鈕關閉
            closeDiv.addEventListener('click', function (e) {
                e.stopPropagation();
                // fadeOut 動畫
                modal.style.opacity = '0';
                modal.style.background = 'rgba(0,0,0,0)';
                imgContainer.style.opacity = '0';
                imgContainer.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 400);
            });

            // 按 ESC 鍵關閉
            const handleKeyDown = function (e) {
                if (e.key === 'Escape') {
                    // fadeOut 動畫
                    modal.style.opacity = '0';
                    modal.style.background = 'rgba(0,0,0,0)';
                    imgContainer.style.opacity = '0';
                    imgContainer.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        document.body.removeChild(modal);
                        document.removeEventListener('keydown', handleKeyDown);
                    }, 400);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        }

        // ---------- Gallery 管理 Helpers ----------
        function createGalleryManagerItem(src, name) {
            const wrapper = document.createElement('div');
            wrapper.className = 'gallery-item';
            wrapper.dataset.src = src;

            // 顯示檔案名稱（若沒有提供 name，嘗試從 src 擷取）
            let displayName = name || '';
            if (!displayName) {
                try {
                    if (src.startsWith('data:')) displayName = '上載圖片';
                    else displayName = src.split('/').pop();
                } catch (e) {
                    displayName = '圖片';
                }
            }

            const filenameDiv = document.createElement('div');
            filenameDiv.className = 'gallery-filename';
            filenameDiv.textContent = displayName;
            filenameDiv.style.padding = '8px 12px';
            filenameDiv.style.background = 'rgba(0,0,0,0.05)';
            filenameDiv.style.borderRadius = '8px';

            const controls = document.createElement('div');
            controls.className = 'gallery-controls';

            const replaceBtn = document.createElement('button');
            replaceBtn.className = 'gallery-control-btn';
            replaceBtn.title = '替換';
            replaceBtn.innerHTML = '✏️';
            replaceBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = function (ev) {
                    const file = ev.target.files && ev.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = function (r) {
                        const newSrc = r.target.result;
                        // 更新 gallery 上對應的圖片 (可能有多張相同 src)
                        const gallery = document.getElementById('imagesGallery');
                        const imgs = Array.from(gallery.querySelectorAll('.gallery-image'));
                        imgs.forEach(gimg => {
                            if (gimg.src === wrapper.dataset.src) {
                                gimg.src = newSrc;
                                gimg.alt = file.name || gimg.alt;
                            }
                        });
                        // 更新管理項目資料
                        wrapper.dataset.src = newSrc;
                        filenameDiv.textContent = file.name || '上載圖片';
                        // 重新生成年曆與管理面板
                        generateCalendar();
                        populateGalleryManager();
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'gallery-control-btn';
            deleteBtn.title = '刪除';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                wrapper.remove();
                const gallery = document.getElementById('imagesGallery');
                const imgs = Array.from(gallery.querySelectorAll('.gallery-image'));
                imgs.forEach(gimg => {
                    if (gimg.src === wrapper.dataset.src) gimg.remove();
                });
                generateCalendar();
                populateGalleryManager();
            });

            controls.appendChild(replaceBtn);
            controls.appendChild(deleteBtn);

            wrapper.appendChild(filenameDiv);
            wrapper.appendChild(controls);
            return wrapper;
        }

        function populateGalleryManager() {
            const manager = document.getElementById('galleryManager');
            const gallery = document.getElementById('imagesGallery');
            manager.innerHTML = '';
            const imgs = gallery.querySelectorAll('.gallery-image');
            if (imgs.length === 0) {
                const p = document.createElement('div');
                p.textContent = '目前畫廊無圖片，可點「新增畫廊圖片」上載。';
                manager.appendChild(p);
                return;
            }
            imgs.forEach(i => {
                const item = createGalleryManagerItem(i.src, i.alt);
                manager.appendChild(item);
            });
        }

        // 2026年香港公眾假期
        const holidays = {
            '2026-01-01': '元旦',
            '2026-01-17': '農曆新年初一',
            '2026-01-18': '農曆新年初二',
            '2026-01-19': '農曆新年初三',
            '2026-04-17': '耶穌受\n難節',
            '2026-04-18': '耶穌受難節翌日',
            '2026-04-20': '復活節星期一',
            '2026-05-01': '勞動節',
            '2026-05-26': '佛誕',
            '2026-06-16': '端午節',
            '2026-07-01': '香港特區紀念日',
            '2026-10-01': '國慶日',
            '2026-10-06': '中秋節\n翌日',
            '2026-10-09': '重陽節',
            '2026-12-25': '聖誕節',
            '2026-12-26': '節禮日'
        };

        const monthNames = [
            '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'
        ];

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

        function generateCalendar() {
            const monthsGrid = document.getElementById('monthsGrid');

            // 清空現有月份卡片，避免重複生成
            monthsGrid.innerHTML = '';

            // 獲取可用的背景圖片
            const galleryImages = document.querySelectorAll('.gallery-image');

            for (let month = 0; month < 12; month++) {
                const monthCard = document.createElement('div');
                monthCard.className = 'month-card';

                // 為每個月份卡片設置背景圖片
                if (galleryImages.length > 0) {
                    const imageIndex = month % galleryImages.length;
                    const backgroundImage = galleryImages[imageIndex].src;
                    monthCard.style.backgroundImage = `url('${backgroundImage}')`;
                }

                const monthTitle = document.createElement('div');
                monthTitle.className = 'month-title';
                monthTitle.textContent = monthNames[month];
              
                if (window.__selectedMonthTitleBgColor) {
                    monthTitle.style.background = window.__selectedMonthTitleBgColor;
                }
                // 預設漸層，只有用戶選擇顏色才覆蓋
                let defaultGradient = 'linear-gradient(135deg, #ff740087 0%, #ff5900 100%)';
                monthTitle.style.background = defaultGradient;
                // monthTitle.style.padding = '6px 8px';
                monthTitle.style.borderRadius = '6px';
                monthTitle.style.color = '#fff';

                const weekdaysDiv = document.createElement('div');
                weekdaysDiv.className = 'weekdays';

                weekdays.forEach(day => {
                    const weekdayDiv = document.createElement('div');
                    weekdayDiv.className = 'weekday';
                    weekdayDiv.textContent = day;
                    weekdaysDiv.appendChild(weekdayDiv);
                });

                const daysGrid = document.createElement('div');
                daysGrid.className = 'days-grid';

                // 獲取該月第一天和最後一天
                const firstDay = new Date(2026, month, 1);
                const lastDay = new Date(2026, month + 1, 0);
                const firstDayOfWeek = firstDay.getDay();
                const daysInMonth = lastDay.getDate();

                // 在第一行添加空白格子來對齊星期
                for (let i = 0; i < firstDayOfWeek; i++) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.className = 'day empty';
                    daysGrid.appendChild(emptyDiv);
                }

                // 生成該月的所有日子
                for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(2026, month, day);

                    const dayDiv = document.createElement('div');
                    dayDiv.className = 'day';

                    const dateNumber = document.createElement('div');
                    dateNumber.textContent = day;
                    dayDiv.appendChild(dateNumber);

                    // 使用本地日期格式，避免時區問題
                    const year = currentDate.getFullYear();
                    const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(currentDate.getDate()).padStart(2, '0');
                    const dateString = `${year}-${monthStr}-${dayStr}`;

                    // 檢查是否為假期
                    if (holidays[dateString]) {
                        dayDiv.classList.add('holiday');
                        dayDiv.title = holidays[dateString].replace('\n', ' ');

                        const holidayName = document.createElement('div');
                        holidayName.className = 'holiday-name';
                        
                        // 處理換行符號，將 \n 轉換為實際的換行顯示
                        const holidayText = holidays[dateString];
                        if (holidayText.includes('\n')) {
                            // 如果包含換行符號，使用 innerHTML 並將 \n 轉換為 <br>
                            holidayName.innerHTML = holidayText.replace(/\n/g, '<br>');
                        } else {
                            // 如果不包含換行符號，使用 textContent
                            holidayName.textContent = holidayText;
                        }
                        
                        dayDiv.appendChild(holidayName);
                    }

                    // 檢查星期幾
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek === 0) {
                        dayDiv.classList.add('sunday');
                    } else if (dayOfWeek === 6) {
                        dayDiv.classList.add('saturday');
                    }

                    daysGrid.appendChild(dayDiv);
                }

                monthCard.appendChild(monthTitle);
                monthCard.appendChild(weekdaysDiv);
                monthCard.appendChild(daysGrid);
                monthsGrid.appendChild(monthCard);

                // 為每個月份卡片添加延遲的淡入動畫
                setTimeout(() => {
                    monthCard.classList.add('fade-in');
                }, month * 150); // 每個卡片延遲 150ms
            }
        }

        // 生成年曆（移除重複調用）
        // generateCalendar(); // 已在 DOMContentLoaded 中調用

        // 載入圖片畫廊（移除重複調用）
        // loadGalleryImages(); // 已在 DOMContentLoaded 中調用



        // 列印年曆功能 - 300 DPI 高解析度
        function printCalendar() {
            const sizeSelect = document.getElementById('printSizeSelect');
            const selectedSize = sizeSelect.value;
            
            console.log('準備列印，選擇的尺寸:', selectedSize);
            
            // 動態設定頁面尺寸
            const existingStyle = document.getElementById('dynamic-print-style');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            const style = document.createElement('style');
            style.id = 'dynamic-print-style';
            style.innerHTML = `
                @media print {
                    @page {
                        size: ${selectedSize} portrait !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        orphans: 1 !important;
                        widows: 1 !important;
                    }
                }
            `;
            document.head.appendChild(style);
            
            console.log('已應用列印樣式:', selectedSize);
            
            // 給瀏覽器一點時間應用新樣式
            setTimeout(() => {
                window.print();
            }, 100);
        }

        // 更新日曆容器尺寸
        function updateCalendarSize(size) {
            const container = document.querySelector('.calendar-container');
            
            // 移除所有尺寸類別
            container.classList.remove('size-A4', 'size-A3', 'size-A2');
            
            // 添加新的尺寸類別
            container.classList.add(`size-${size}`);
            
            console.log('已更新容器尺寸為:', size);
        }

        // 更新 calendar-container 背景
        function updateContainerBackground(bgValue) {
            const container = document.querySelector('.calendar-container');
            if (!container) return;

            let imageUrl = '';
            if (!bgValue || bgValue === 'none') {
                // 恢復預設底部背景
                container.style.backgroundImage = "url('bg/footer.png')";
                container.style.backgroundRepeat = 'no-repeat';
                container.style.backgroundPosition = 'bottom center';
                container.style.backgroundSize = 'contain';
                return;
            }

            if (bgValue.startsWith('data:')) {
                imageUrl = bgValue;
            } else {
                imageUrl = `background/${bgValue}`;
            }

            // 將圖片設為容器的主背景（覆蓋原本的底部footer背景）
            container.style.backgroundImage = `url('${imageUrl}')`;
            container.style.backgroundRepeat = 'no-repeat';
            container.style.backgroundPosition = 'center top';
            container.style.backgroundSize = 'cover';
        }







        // 顯示成功訊息的簡化版本
        function showSuccessMessage(message) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; padding: 30px 40px; border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center;
                font-family: Microsoft JhengHei, sans-serif; z-index: 10002;
                max-width: 400px;
            `;
            
            modal.innerHTML = `
                <div style="color: #28a745; font-size: 2.5rem; margin-bottom: 15px;">✅</div>
                <p style="color: #333; font-size: 1rem; margin: 0 0 20px 0; line-height: 1.5;">${message}</p>
                <button onclick="this.closest('div').remove()" 
                        style="background: #28a745; color: white; border: none; padding: 8px 20px; 
                               border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                    確定
                </button>
            `;
            
            document.body.appendChild(modal);
            
            // 3秒後自動關閉
            setTimeout(() => {
                if (modal && modal.parentNode) {
                    modal.remove();
                }
            }, 3000);
        }

        // 列印教學指南
        function showPrintGuide() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText =
                'position: fixed; top: 0; left: 0; width: 100%; height: 100%; ' +
                'background: rgba(0,0,0,0.4); display: flex; align-items: center; ' +
                'justify-content: center; z-index: 10001; backdrop-filter: blur(3px);';

            modal.innerHTML = `
                <div class="modal-content" style="background: white; padding: 50px; border-radius: 25px; 
                     box-shadow: 0 30px 80px rgba(0,0,0,0.4); max-width: 750px; width: 95%; max-height: 90vh; 
                     overflow-y: auto; font-family: Microsoft JhengHei, sans-serif; text-align: center; position: relative;">
                    
                    <!-- 關閉按鈕 -->
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            style="position: absolute; top: 20px; right: 20px; 
                                   background: rgba(108, 117, 125, 0.1); border: none; 
                                   width: 40px; height: 40px; border-radius: 50%; 
                                   color: #6c757d; font-size: 18px; font-weight: bold; 
                                   cursor: pointer; display: flex; align-items: center; 
                                   justify-content: center; transition: all 0.3s ease;
                                   z-index: 1;"
                            onmouseover="this.style.background='rgba(220, 53, 69, 0.1)'; this.style.color='#dc3545';" 
                            onmouseout="this.style.background='rgba(108, 117, 125, 0.1)'; this.style.color='#6c757d';"
                            title="關閉教學視窗">
                        ×
                    </button>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #667eea; margin-bottom: 15px; font-size: 2rem;">�️ 年曆列印教學</h2>
                        <p style="color: #666; font-size: 1.1rem;">完整的列印設定指南，獲得最佳列印效果</p>
                    </div>

                    <!-- 尺寸選擇說明 -->
                    <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 30px; border-radius: 15px; margin: 25px 0; text-align: left;">
                        <h3 style="color: #495057; margin-bottom: 20px; text-align: center;">📏 尺寸選擇</h3>
                        <ul style="font-size: 1.1rem; line-height: 1.8; color: #333; list-style: none; padding: 0;">
                            <li style="margin-bottom: 12px;">📄 <strong>A4 (210×297mm)</strong> - 標準尺寸，家用印表機常用</li>
                            <li style="margin-bottom: 12px;">📄 <strong>A3 (297×420mm)</strong> - 較大尺寸，更清晰的細節</li>
                            <li style="margin-bottom: 12px;">📄 <strong>A2 (420×594mm)</strong> - 大型尺寸，專業列印使用</li>
                            <li style="margin-bottom: 12px;">⚙️ <strong>動態調整</strong> - 螢幕顯示會隨選擇變化</li>
                            <li style="margin-bottom: 12px;">� <strong>300 DPI</strong> - 高解析度列印品質</li>
                        </ul>
                    </div>

                    <!-- 列印步驟 -->
                    <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 30px; border-radius: 15px; margin: 25px 0;">
                        <h3 style="color: #1976d2; margin-bottom: 25px;">�️ 列印步驟</h3>
                        <div style="text-align: left;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 15px; background: white; border-radius: 10px;">
                                <div style="background: #4285f4; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</div>
                                <div>
                                    <div style="font-weight: 600; color: #1976d2;">選擇顯示尺寸</div>
                                    <div style="color: #666; font-size: 0.9rem;">在上方下拉選單選擇A4、A3或A2</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 15px; background: white; border-radius: 10px;">
                                <div style="background: #34a853; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</div>
                                <div>
                                    <div style="font-weight: 600; color: #1976d2;">點擊「🖨️ 300 DPI 列印」</div>
                                    <div style="color: #666; font-size: 0.9rem;">開啟瀏覽器列印對話框</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 10px;">
                                <div style="background: #ea4335; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">3</div>
                                <div>
                                    <div style="font-weight: 600; color: #1976d2;">確認列印設定</div>
                                    <div style="color: #666; font-size: 0.9rem;">檢查尺寸設定並開始列印</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 列印設定建議 -->
                    <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 30px; border-radius: 15px; margin: 25px 0;">
                        <h3 style="color: #7b1fa2; margin-bottom: 25px;">⚙️ 列印設定建議</h3>
                        <div style="text-align: left;">
                            <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
                                <div style="font-weight: 600; color: #7b1fa2; margin-bottom: 10px;">紙張設定</div>
                                <div style="color: #666;">選擇對應的紙張尺寸（A4/A3/A2），確保印表機支援該尺寸</div>
                            </div>
                            
                            <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
                                <div style="font-weight: 600; color: #7b1fa2; margin-bottom: 10px;">列印品質</div>
                                <div style="color: #666;">建議選擇「高品質」或「最佳品質」，獲得清晰的文字和圖片</div>
                            </div>
                            
                            <div style="background: white; padding: 20px; border-radius: 12px;">
                                <div style="font-weight: 600; color: #7b1fa2; margin-bottom: 10px;">方向設定</div>
                                <div style="color: #666;">選擇「縱向/直向 (Portrait)」，年曆採用直向設計</div>
                            </div>
                        </div>
                    </div>

                    <!-- 按鈕區域 -->
                    <div style="margin-top: 35px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="this.closest('.modal-overlay').remove(); printCalendar();" 
                                style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; 
                                       padding: 18px 35px; border-radius: 12px; font-weight: 600; font-size: 1.1rem; 
                                       display: flex; align-items: center; gap: 10px; transition: transform 0.2s; 
                                       box-shadow: 0 4px 15px rgba(102,126,234,0.3); cursor: pointer;"
                                onmouseover="this.style.transform='translateY(-2px)'" 
                                onmouseout="this.style.transform='translateY(0)'">
                            🖨️ 立即列印
                        </button>
                        
                        <button onclick="this.closest('.modal-overlay').remove()" 
                                style="background: #6c757d; color: white; border: none; padding: 18px 35px; 
                                       border-radius: 12px; cursor: pointer; font-size: 1.1rem; font-weight: 600;
                                       transition: transform 0.2s;"
                                onmouseover="this.style.transform='translateY(-2px)'" 
                                onmouseout="this.style.transform='translateY(0)'">
                            關閉
                        </button>
                    </div>

                    <!-- 小提示 -->
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 10px; margin-top: 25px; text-align: left;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem; margin-right: 10px;">💡</span>
                            <strong style="color: #856404;">列印小貼士</strong>
                        </div>
                        <div style="color: #856404; line-height: 1.6;">
                            • 建議使用彩色印表機以完整呈現年曆色彩<br>
                            • A3和A2尺寸可能需要專業印表機或影印店<br>
                            • 列印前可先使用「預覽列印」功能檢查效果
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 點擊背景關閉模態窗口
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // 按ESC鍵關閉模態窗口
            const handleEscKey = function(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', handleEscKey);
                }
            };
            document.addEventListener('keydown', handleEscKey);
        }

        // 增強的網頁載入完成處理
        document.addEventListener('DOMContentLoaded', function () {
        function updateMonthsGridPadding() {
            const gallery = document.getElementById('imagesGallery');
            const monthsGrid = document.getElementById('monthsGrid');
            if (!gallery || !monthsGrid) return;
            const count = gallery.querySelectorAll('img').length;
            monthsGrid.style.paddingTop = (count > 10) ? '10px' : '15px';
            // 新增：根據圖片數量調整寬度
            const imgs = gallery.querySelectorAll('img');
            const imgWidth = (count > 10) ? '8%' : '8%';
            imgs.forEach(img => {
                img.style.width = imgWidth;
            });
        }

    // 初始執行
    updateMonthsGridPadding();

    // 監聽 images-gallery 變化
    const galleryObserver = new MutationObserver(updateMonthsGridPadding);
    const gallery = document.getElementById('imagesGallery');
    if (gallery) {
        galleryObserver.observe(gallery, { childList: true });
    }
            // 先載入圖片，圖片載入完成後會自動生成日曆
            loadGalleryImages();
            
            // 初始化列印尺寸選擇器
            const printSizeSelect = document.getElementById('printSizeSelect');
            if (printSizeSelect) {
                // 初始化為A4尺寸
                updateCalendarSize('A4');
                
                // 監聽尺寸變更
                printSizeSelect.addEventListener('change', function() {
                    const selectedSize = this.value;
                    updateCalendarSize(selectedSize);
                    console.log('使用者選擇尺寸:', selectedSize);
                });
                
                console.log('列印尺寸選擇器已初始化');
            }

            // 初始化背景主題選擇器
            const bgSelect = document.getElementById('bgSelect');
            if (bgSelect) {
                bgSelect.addEventListener('change', function() {
                    updateHeaderBackground(this.value);
                });
                // 預設載入
                updateHeaderBackground(bgSelect.value);
            }

            // 處理使用者上載背景圖片
            const bgUploadInput = document.getElementById('bgUploadInput');
            if (bgUploadInput) {
                bgUploadInput.addEventListener('change', function (e) {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    // 只接受影像檔
                    if (!file.type.startsWith('image/')) {
                        alert('請上載圖片檔案（jpg/png/gif 等）');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        const dataUrl = ev.target.result;
                        // 將上載的圖片加入下拉選單並選中
                        const option = document.createElement('option');
                        option.value = dataUrl;
                        option.textContent = `上載: ${file.name}`;
                        // 把它放在最前面
                        bgSelect.insertBefore(option, bgSelect.firstChild);
                        bgSelect.value = dataUrl;
                        updateHeaderBackground(dataUrl);
                    };
                    reader.readAsDataURL(file);
                });
            }

                // 處理 calendar-container 背景選擇與上載
                const containerBgSelect = document.getElementById('containerBgSelect');
                const containerBgUpload = document.getElementById('containerBgUpload');
                if (containerBgSelect) {
                    containerBgSelect.addEventListener('change', function () {
                        updateContainerBackground(this.value);
                    });
                }

                if (containerBgUpload) {
                    containerBgUpload.addEventListener('change', function (e) {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                            alert('請上載圖片檔案（jpg/png/gif 等）');
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = function (ev) {
                            const dataUrl = ev.target.result;
                            // 新增選項並選中
                            if (containerBgSelect) {
                                const opt = document.createElement('option');
                                opt.value = dataUrl;
                                opt.textContent = `上載: ${file.name}`;
                                containerBgSelect.insertBefore(opt, containerBgSelect.firstChild);
                                containerBgSelect.value = dataUrl;
                            }
                            updateContainerBackground(dataUrl);
                        };
                        reader.readAsDataURL(file);
                    });
                }

                // Gallery 管理按鈕
                const addGalleryBtn = document.getElementById('addGalleryImageBtn');
                const addGalleryInput = document.getElementById('addGalleryInput');
                const clearGalleryBtn = document.getElementById('clearGalleryBtn');
                if (addGalleryBtn && addGalleryInput) {
                    addGalleryBtn.addEventListener('click', function () {
                        addGalleryInput.click();
                    });
                    addGalleryInput.addEventListener('change', function (e) {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                            alert('請上載圖片檔案（jpg/png/gif 等）');
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = function (ev) {
                            // 在 imagesGallery 中加入圖片
                            const gallery = document.getElementById('imagesGallery');
                            const galleryImg = document.createElement('img');
                            galleryImg.src = ev.target.result;
                            galleryImg.alt = file.name;
                            galleryImg.className = 'gallery-image';
                            // 新增：點擊可放大
                            galleryImg.addEventListener('click', function () {
                                showImageModal(galleryImg);
                            });
                            gallery.appendChild(galleryImg);
                            populateGalleryManager();
                            generateCalendar();
                        };
                        reader.readAsDataURL(file);
                    });
                }

                if (clearGalleryBtn) {
                    clearGalleryBtn.addEventListener('click', function () {
                        const gallery = document.getElementById('imagesGallery');
                        gallery.innerHTML = '';
                        populateGalleryManager();
                        generateCalendar();
                    });
                }

                // 初始填充 gallery manager（如果畫廊已有圖片）
                populateGalleryManager();

            // 處理 H1 顏色選擇器
            const h1ColorPicker = document.getElementById('h1ColorPicker');
            if (h1ColorPicker) {
                h1ColorPicker.addEventListener('input', function () {
                    const h1 = document.querySelector('.calendar-header h1');
                    if (h1) {
                        // 移除原本的背景漸層裁切文本效果，直接套用純色
                        h1.style.background = 'none';
                        h1.style.backgroundImage = 'none';
                        h1.style.webkitBackgroundClip = 'unset';
                        h1.style.backgroundClip = 'unset';
                        // 設定文字色，並同時設定 -webkit-text-fill-color，以確保在 WebKit 上生效
                        h1.style.color = this.value;
                        h1.style.webkitTextFillColor = this.value;
                    }
                });
            }

            // 處理月份標題背景顏色選擇器
            const monthTitleColorPicker = document.getElementById('monthTitleColorPicker');
            // 初始化全域變數 (背景色)
            window.__selectedMonthTitleBgColor = (monthTitleColorPicker && monthTitleColorPicker.value) || '#ffffff';
            if (monthTitleColorPicker) {
                monthTitleColorPicker.addEventListener('input', function () {
                    window.__selectedMonthTitleBgColor = this.value;
                    // 套用到現有的 .month-title
                    document.querySelectorAll('.month-title').forEach(el => {
                        el.style.background = this.value;
                        el.style.padding = '6px 8px';
                        el.style.borderRadius = '6px';
                        // 如果背景顏色較淺，保留白色文字，否則自動切換黑/白（簡單處理）
                        el.style.color = '#fff';
                    });
                });
            }
        });