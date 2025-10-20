$(document).ready(() => {
    let data = {
        position: null,
        scale: null,
        image: null,
        min: {
            width: 50,
            height: 50
        }
    }
    
    let ORIGINAL_POS = null;
    let ORIGINAL_SCALE = null;
    let EDIT_MODE = false;
    let IS_RESIZING = false;
    let RESIZE_DIRECTION = '';
    
    $('.watermark-container').draggable({
        containment: "window",
        stop: function(event, ui) {
            const width = $(window).width();
            const height = $(window).height();
            const cx = ui.position.left + (parseInt($(this).css('width')) / 2);
            const cy = ui.position.top + (parseInt($(this).css('height')) / 2);
            
            data.position = {
                x: cx / width,
                y: cy / height
            };
        }
    });
    
    $('.watermark-container').draggable('disable');
    
    $(document).on('keyup', function(e) {
        if (e.key === "Escape" && EDIT_MODE) {
            SaveChanges();
        }
    });
    
    function EnterEditMode() {
        EDIT_MODE = true;
        
        if (!data.position || !data.scale) {
            return;
        }
        
        ORIGINAL_POS = { ...data.position };
        ORIGINAL_SCALE = { ...data.scale };
        
        $('.watermark-container').show();
        
        if ($('.resize-handle').length === 0) {
            AddResizeHandles();
        } else {
            $('.resize-handle').show();
        }
        
        $('.edit-mode-container').removeClass('hidden');
        
        $('.watermark-container').draggable('enable');
        
        $('.watermark-container').css('cursor', 'move');
        
        $.post(`https://${GetParentResourceName()}/edit-mode-active`, JSON.stringify({}));
    }
    
    function AddResizeHandles() {
        const handles = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
        const container = $('.watermark-container');
        
        handles.forEach(direction => {
            const handle = $('<div class="resize-handle ' + direction + '"></div>');
            container.append(handle);
        });
        
        SetupResizeEvents();
    }
    
    function ExitEditMode() {
        EDIT_MODE = false;
        
        $('.edit-overlay').addClass('FadeOut');
        
        $('.resize-handle').hide();
        
        setTimeout(() => {
            $('.edit-mode-container').addClass('hidden');
            $('.edit-overlay').removeClass('FadeOut');
        }, 300);
        
        $('.watermark-container').draggable('disable');
        
        $('.watermark-container').css('cursor', 'default');
        
        $.post(`https://${GetParentResourceName()}/edit-mode-inactive`, JSON.stringify({}));
    }
    
    function SaveChanges() {
        $.post(`https://${GetParentResourceName()}/save-settings`, JSON.stringify({
            position: data.position,
            scale: data.scale
        }));
        
        ExitEditMode();
    }

    
    function UpdateWatermarkPosition() {
        $('.watermark-container').css({
            top: `calc(${data.position.y * 100}% - ${data.scale.height / 2}px)`,
            left: `calc(${data.position.x * 100}% - ${data.scale.width / 2}px)`,
            width: data.scale.width,
            height: data.scale.height,
        });
    }
    
    function SetupResizeEvents() {
        const container = $('.watermark-container');
        
        $('.resize-handle').on('mousedown', function(e) {
            e.preventDefault();
            IS_RESIZING = true;
            RESIZE_DIRECTION = $(this).attr('class').replace('resize-handle ', '');
            container.draggable('disable');
            container.addClass('resizing');
            
            $(document).on('mousemove.resize', HandleResize);
            $(document).on('mouseup.resize', StopResizing);
        });
        
        function HandleResize(e) {
            if (!IS_RESIZING) return;
            
            const containerPos = container.position();
            const containerWidth = container.width();
            const containerHeight = container.height();
            const windowWidth = $(window).width();
            const windowHeight = $(window).height();
            
            let newData = { scale: { width: containerWidth, height: containerHeight }, position: { x: containerPos.left, y: containerPos.top } };
            
            if (RESIZE_DIRECTION.includes('e')) {
                newData.scale.width = Math.max(data.min.width, e.clientX - containerPos.left);
                newData.scale.width = Math.min(newData.scale.width, windowWidth - containerPos.left);
            }

            if (RESIZE_DIRECTION.includes('w')) {
                const diff = containerPos.left - e.clientX;
                newData.scale.width = Math.max(data.min.width, containerWidth + diff);
                newData.position.x = Math.max(0, e.clientX);
                if (newData.position.x > e.clientX) {
                    newData.scale.width = containerWidth + containerPos.left - newData.position.x;
                }
            }

            if (RESIZE_DIRECTION.includes('s')) {
                newData.scale.height = Math.max(data.min.height, e.clientY - containerPos.top);
                newData.scale.height = Math.min(newData.scale.height, windowHeight - containerPos.top);
            }

            if (RESIZE_DIRECTION.includes('n')) {
                const diff = containerPos.top - e.clientY;
                newData.scale.height = Math.max(data.min.height, containerHeight + diff);
                newData.position.y = Math.max(0, e.clientY);
                if (newData.position.y > e.clientY) {
                    newData.scale.height = containerHeight + containerPos.top - newData.position.y;
                }
            }
            
            if (newData.position.x + newData.scale.width > windowWidth) {
                newData.scale.width = windowWidth - newData.position.x;
            }

            if (newData.position.y + newData.scale.height > windowHeight) {
                newData.scale.height = windowHeight - newData.position.y;
            }
            
            newData.scale.width = Math.max(data.min.width, newData.scale.width);
            newData.scale.height = Math.max(data.min.height, newData.scale.height);
            
            if (newData.scale.width === data.min.width && newData.position.x + newData.scale.width > windowWidth) {
                newData.position.x = windowWidth - data.min.width;
            }
            
            if (newData.scale.height === data.min.height && newData.position.y + newData.scale.height > windowHeight) {
                newData.position.y = windowHeight - data.min.height;
            }
            
            container.css({
                width: newData.scale.width,
                height: newData.scale.height,
                top: newData.position.y,
                left: newData.position.x
            });
            
            data.scale = {
                width: newData.scale.width,
                height: newData.scale.height
            };
            
            const width = $(window).width();
            const height = $(window).height();
            const cx = newData.position.x + (newData.scale.width / 2);
            const cy = newData.position.y + (newData.scale.height / 2);
            
            data.position = {
                x: cx / width,
                y: cy / height
            };
        }
        
        function StopResizing() {
            if (IS_RESIZING) {
                IS_RESIZING = false;
                $(document).off('mousemove.resize');
                $(document).off('mouseup.resize');
                container.removeClass('resizing'); // Remove resizing class when done
                container.draggable('enable');
                
                data.scale = {
                    width: container.width(),
                    height: container.height()
                };
            }
        }
    }

    window.addEventListener('message', (event) => {
        const { action, meta } = event.data;

        if (action === 'set-watermark') { 
            data.position = meta.position;
            data.scale = meta.scale;
            data.image = meta.image;
            if (meta.min) {
                data.min = meta.min;
            }

            $('.watermark-container img').attr('src', data.image);
            $('.watermark-container').show();
            UpdateWatermarkPosition();

        } else if (action === 'edit-watermark') {
            EnterEditMode();
        }
    });
})
