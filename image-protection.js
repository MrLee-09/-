// image-protection.js - 优化版图片防盗系统（移除所有警告弹窗，保留核心保护功能）
class ImageProtection {
    constructor(options = {}) {
        this.config = {
            showRightClickWarning: false,  // 关闭弹窗警告
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
            } else {
                // 即使不显示警告，也要禁用右键
                this.disableRightClickSilent();
            }
            
            if (this.config.enableDragProtection) {
                this.disableDrag();
            }
            
            if (this.config.enableKeyboardProtection) {
                this.disableKeyboardShortcuts();
            }
            
            this.protectAllImages();
            
            console.log('✅ 图片防盗系统已启用（无弹窗模式）');
        } catch (error) {
            console.warn('⚠️ 图片保护系统部分功能初始化失败:', error);
        }
    }
    
    disableRightClickSilent() {
        // 静默禁用右键，不显示警告
        document.addEventListener('contextmenu', (e) => {
            const target = e.target;
            const isImageElement = this.isImageRelatedElement(target);
            
            if (isImageElement) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            const target = e.target;
            const isImageElement = this.isImageRelatedElement(target);
            
            if (isImageElement) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    disableDrag() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG' || this.isImageRelatedElement(e.target)) {
                e.preventDefault();
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
                return false;
            }
            
            // 禁用截图快捷键
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                return false;
            }
            
            // 禁用复制快捷键（仅对图片相关元素）
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const selection = window.getSelection();
                const selectedElement = selection.anchorNode?.parentElement;
                
                if (selectedElement && this.isImageRelatedElement(selectedElement)) {
                    e.preventDefault();
                    return false;
                }
            }
            
            // 开发者工具快捷键禁用（静默）
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.metaKey && e.altKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') || 
                (e.metaKey && e.altKey && e.key === 'J') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') || 
                (e.metaKey && e.altKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'u') || (e.metaKey && e.key === 'u') ||
                e.key === 'F2' || e.key === 'F8' || e.key === 'F10' ||
                (e.ctrlKey && e.shiftKey && e.key === 'K') ||
                (e.metaKey && e.altKey && e.key === 'K')) {
                e.preventDefault();
                return false;
            }
        }, true);
        
        // 防止开发者工具通过其他方式打开
        this.preventDevToolsOpening();
    }
    
    // 防止开发者工具通过其他方式打开
    preventDevToolsOpening() {
        const checkDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                // 静默处理，不显示警告
                console.log('检测到开发者工具已打开');
            }
        };
        
        setInterval(checkDevTools, 1000);
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
        // 空函数，不显示任何警告弹窗
        return;
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
                showRightClickWarning: false, // 关闭弹窗警告
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
            console.warn('图片保护系统初始化失败:', error);
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