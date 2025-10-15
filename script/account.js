 // Chuyển đổi giữa form đăng nhập và đăng ký
        function toggleForms() {
            const container = document.getElementById('container');
            container.classList.toggle('active');
        }

        // Hiển thị/ẩn mật khẩu
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
        }

        // Xử lý form đăng ký
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const message = document.getElementById('registerMessage');

            // Kiểm tra validation
            if (password !== confirmPassword) {
                showMessage(message, 'Mật khẩu xác nhận không khớp!', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage(message, 'Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                return;
            }

            // Giả lập đăng ký thành công
            showMessage(message, 'Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            
            // Reset form
            this.reset();
            
            // Tự động chuyển sang form đăng nhập sau 2 giây
            setTimeout(() => {
                toggleForms();
            }, 2000);
        });

        // Xử lý form đăng nhập
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const message = document.getElementById('loginMessage');

            // Giả lập đăng nhập thành công
            if (email && password) {
                showMessage(message, 'Đăng nhập thành công!', 'success');
                // Trong thực tế, bạn sẽ chuyển hướng đến trang chính ở đây
                // window.location.href = 'dashboard.html';
            } else {
                showMessage(message, 'Vui lòng nhập đầy đủ thông tin!', 'error');
            }
        });

        // Hiển thị thông báo
        function showMessage(element, text, type) {
            element.textContent = text;
            element.className = 'message ' + type;
            element.style.display = 'block';
            
            // Ẩn thông báo sau 5 giây
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }

        // Kiểm tra mật khẩu xác nhận real-time
        document.getElementById('registerConfirmPassword').addEventListener('input', function() {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = this.value;
            const message = document.getElementById('registerMessage');

            if (confirmPassword && password !== confirmPassword) {
                showMessage(message, 'Mật khẩu xác nhận không khớp!', 'error');
            } else if (confirmPassword && password === confirmPassword) {
                showMessage(message, 'Mật khẩu khớp!', 'success');
            }
        });