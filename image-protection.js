// image-protection.js - 优化版图片防盗系统（移除动态水印，增强快捷键防护）
class ImageProtection {
    constructor(options = {}) {
        this.config = {
            showRightClickWarning: true,
            enableDragProtection: true,
            enableKeyboardProtection: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        console.log('🔒 图片防盗系统初始化...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupProtection();
            });
        } else {
            this.setupProtection();
        }
    }
    
    setupProtection() {
        try {
            if (this.config.showRightClickWarning) {
                this.disableRightClick();
            }
            
            if (this.config.enableDragProtection) {
                this.disableDrag();
            }
            
            if (this.config.enableKeyboardProtection) {
                this.disableKeyboardShortcuts();
            }
            
            this.protectAllImages();
            
            console.log('✅ 图片防盗系统已启用');
        } catch (error) {
            console.warn('⚠️ 图片保护系统部分功能初始化失败:', error);
        }
    }
    
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            const target = e.target;
            const isImageElement = this.isImageRelatedElement(target);
            
            if (isImageElement) {
                e.preventDefault();
                this.showWarning('⚠️ 右键功能已禁用 - 图片受版权保护');
                return false;
            }
        });
    }
    
    disableDrag() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG' || this.isImageRelatedElement(e.target)) {
                e.preventDefault();
                this.showWarning('⚠️ 图片拖拽已禁用');
                return false;
            }
        }, true);
        
        const protectDrag = () => {
            document.querySelectorAll('img').forEach(img => {
                img.setAttribute('draggable', 'false');
                img.style.userDrag = 'none';
            });
        };
        
        protectDrag();
        
        const observer = new MutationObserver(() => {
            protectDrag();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    disableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 禁用保存快捷键
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.showWarning('⚠️ 保存功能已禁用');
                return false;
            }
            
            // 禁用截图快捷键
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                this.showWarning('⚠️ 截图功能已禁用');
                return false;
            }
            
            // 禁用复制快捷键（仅对图片相关元素）
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const selection = window.getSelection();
                const selectedElement = selection.anchorNode?.parentElement;
                
                if (selectedElement && this.isImageRelatedElement(selectedElement)) {
                    e.preventDefault();
                    this.showWarning('⚠️ 复制功能已禁用');
                    return false;
                }
            }
            
            // === 增强的开发者工具禁用快捷键 ===
            
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                this.showWarning('⚠️ 开发者工具已禁用');
                return false;
            }
            
            // Ctrl+Shift+I / Cmd+Opt+I (Mac)
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.metaKey && e.altKey && e.key === 'I')) {
                e.preventDefault();
                this.showWarning('⚠️ 开发者工具已禁用');
                return false;
            }
            
            // Ctrl+Shift+J / Cmd+Opt+J (Mac)
            if ((e.ctrlKey && e.shiftKey && e.key === 'J') || 
                (e.metaKey && e.altKey && e.key === 'J')) {
                e.preventDefault();
                this.showWarning('⚠️ 开发者工具已禁用');
                return false;
            }
            
            // Ctrl+Shift+C / Cmd+Opt+C (Mac) - 检查元素模式
            if ((e.ctrlKey && e.shiftKey && e.key === 'C') || 
                (e.metaKey && e.altKey && e.key === 'C')) {
                e.preventDefault();
                this.showWarning('⚠️ 检查元素功能已禁用');
                return false;
            }
            
            // Ctrl+U - 查看源代码
            if ((e.ctrlKey && e.key === 'u') || (e.metaKey && e.key === 'u')) {
                e.preventDefault();
                this.showWarning('⚠️ 查看源代码功能已禁用');
                return false;
            }
            
            // Ctrl+Shift+U
            if (e.ctrlKey && e.shiftKey && e.key === 'U') {
                e.preventDefault();
                this.showWarning('⚠️ 开发者工具已禁用');
                return false;
            }
            
            // 额外的防护：阻止打开控制台的多种方式
            if (e.key === 'F2' || 
                e.key === 'F8' || 
                e.key === 'F10' || 
                (e.ctrlKey && e.shiftKey && e.key === 'K') ||
                (e.metaKey && e.altKey && e.key === 'K')) {
                e.preventDefault();
                this.showWarning('⚠️ 开发者功能已禁用');
                return false;
            }
        }, true);
        
        // 额外防护：定期检查开发者工具状态
        this.preventDevToolsOpening();
    }
    
    // 防止开发者工具通过其他方式打开
    preventDevToolsOpening() {
        // 检测开发者工具是否打开
        const checkDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                this.showWarning('⚠️ 检测到开发者工具，请关闭以继续浏览');
                // 可以重定向或显示警告
            }
        };
        
        // 定期检查
        setInterval(checkDevTools, 1000);
        
        // 监听窗口大小变化
        window.addEventListener('resize', checkDevTools);
    }
    
    protectAllImages() {
        const protectImages = () => {
            document.querySelectorAll('img').forEach(img => {
                img.setAttribute('oncontextmenu', 'return false;');
                img.setAttribute('ondragstart', 'return false;');
                
                if (!img.style.pointerEvents) {
                    img.style.cssText += `
                        pointer-events: none !important;
                        user-select: none !important;
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        -webkit-user-drag: none !important;
                        -moz-user-drag: none !important;
                        -ms-user-drag: none !important;
                        user-drag: none !important;
                    `;
                }
                
                this.addImageOverlay(img);
            });
        };
        
        protectImages();
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    protectImages();
                }
            });
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: false,
            characterData: false
        });
    }
    
    addImageOverlay(img) {
        const parent = img.parentElement;
        if (!parent) return;
        
        if (parent.querySelector('.image-protection-overlay')) {
            return;
        }
        
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.position === 'static') {
            parent.style.position = 'relative';
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'image-protection-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.001);
            z-index: 1000;
            pointer-events: none;
        `;
        
        parent.appendChild(overlay);
    }
    
    isImageRelatedElement(element) {
        if (!element) return false;
        
        if (element.tagName === 'IMG') return true;
        
        const parent = element.closest('.gallery-item, .detail-image, .thumbnail-item, .image-container');
        if (parent) return true;
        
        const style = window.getComputedStyle(element);
        if (style.backgroundImage && style.backgroundImage !== 'none') {
            return true;
        }
        
        return false;
    }
    
    showWarning(message) {
        const existingWarning = document.getElementById('protection-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        if (!document.getElementById('protection-animations')) {
            const style = document.createElement('style');
            style.id = 'protection-animations';
            style.textContent = `
                @keyframes protectionSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes protectionSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .protection-warning {
                    animation: protectionSlideIn 0.3s ease;
                }
                .protection-warning.hiding {
                    animation: protectionSlideOut 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
        
        const warning = document.createElement('div');
        warning.id = 'protection-warning';
        warning.className = 'protection-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255, 59, 48, 0.95), rgba(255, 95, 87, 0.95));
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            z-index: 1000000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 320px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
        `;
        
        warning.innerHTML = `
            <i class="fas fa-shield-alt" style="font-size: 24px; opacity: 0.9;"></i>
            <div style="flex: 1;">
                <strong style="font-size: 15px; display: block; margin-bottom: 4px;">安全保护</strong>
                <span style="font-size: 13px; opacity: 0.9;">${message}</span>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentElement) {
                warning.classList.add('hiding');
                setTimeout(() => {
                    if (warning.parentElement) {
                        warning.remove();
                    }
                }, 300);
            }
        }, 3500);
        
        warning.addEventListener('click', () => {
            warning.classList.add('hiding');
            setTimeout(() => {
                if (warning.parentElement) {
                    warning.remove();
                }
            }, 300);
        });
    }
    
    reinitialize() {
        this.protectAllImages();
    }
}

// 初始化图片保护系统
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            window.imageProtection = new ImageProtection({
                showRightClickWarning: true,
                enableDragProtection: true,
                enableKeyboardProtection: true
            });
            
            window.ImageProtection = ImageProtection;
            
            window.reprotectImages = () => {
                if (window.imageProtection) {
                    window.imageProtection.reinitialize();
                }
            };
            
        } catch (error) {
            console.warn('图片保护系统初始化失败，但页面将继续正常显示:', error);
        }
    }, 800);
});

// 监听URL变化，重新初始化保护
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
            if (window.imageProtection) {
                window.imageProtection.reinitialize();
            }
        }, 300);
    }
}).observe(document, { subtree: true, childList: true });

// 导出模块（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProtection;
}