const fs = require('fs');

try {
    const rawData = fs.readFileSync('vietnomnom.restaurants.json', 'utf8');
    const restaurants = JSON.parse(rawData);

    console.log(`Đang xử lý ${restaurants.length} nhà hàng (V8: Fix lỗi món ghép + Thêm Quận Hà Nội)...`);

    // --- 1. CÁC HÀM TIỆN ÍCH ---
    function formatCurrency(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function getRandomPrice(min, max) {
        const val = Math.floor(Math.random() * (max - min + 1) + min);
        return Math.ceil(val / 1000) * 1000;
    }

    function normalizePrice(priceStr) {
        let finalMin = 0; let finalMax = 0; let isValid = false;
        if (priceStr && !priceStr.toLowerCase().includes('cập nhật') && priceStr.trim() !== '') {
            const cleanStr = priceStr.replace(/\./g, '').replace(/,/g, '');
            const numbers = cleanStr.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                const parsedNums = numbers.map(n => parseInt(n));
                const validNums = parsedNums.filter(n => n > 1000);
                if (validNums.length > 0) {
                    finalMin = Math.min(...validNums);
                    finalMax = Math.max(...validNums);
                    if (finalMax === finalMin) finalMax = finalMin + 10000;
                    isValid = true;
                }
            }
        }
        if (!isValid) {
            finalMin = getRandomPrice(40000, 150000);
            let potentialMax = finalMin + getRandomPrice(30000, 300000);
            finalMax = Math.min(potentialMax, 500000);
        }
        return `${formatCurrency(finalMin)}đ - ${formatCurrency(finalMax)}đ`;
    }

    function cleanOpeningHours(hoursStr) {
        if (!hoursStr) return "07:00 - 22:00";
        const match = hoursStr.match(/(\d{1,2}:\d{2}.*)/);
        return match ? match[1].trim() : hoursStr;
    }

    // --- [UPDATE] HÀM LẤY QUẬN (Đã thêm Hà Nội) ---
    function getDistrict(address) {
        if (!address) return null;
        const addr = address.toLowerCase();

        // 1. KHỐI HÀ NỘI
        if (addr.includes('hoàn kiếm')) return 'Quận Hoàn Kiếm';
        if (addr.includes('ba đình')) return 'Quận Ba Đình';
        if (addr.includes('đống đa')) return 'Quận Đống Đa';
        if (addr.includes('hai bà trưng')) return 'Quận Hai Bà Trưng';
        if (addr.includes('cầu giấy')) return 'Quận Cầu Giấy';
        if (addr.includes('thanh xuân')) return 'Quận Thanh Xuân';
        if (addr.includes('tây hồ')) return 'Quận Tây Hồ';
        if (addr.includes('hoàng mai')) return 'Quận Hoàng Mai';
        if (addr.includes('long biên')) return 'Quận Long Biên';
        if (addr.includes('hà đông')) return 'Quận Hà Đông';
        if (addr.includes('nam từ liêm')) return 'Quận Nam Từ Liêm';
        if (addr.includes('bắc từ liêm')) return 'Quận Bắc Từ Liêm';
        if (addr.includes('gia lâm')) return 'Huyện Gia Lâm';
        if (addr.includes('đông anh')) return 'Huyện Đông Anh';
        if (addr.includes('ba vì')) return 'Huyện Ba Vì';
        if (addr.includes('chương mỹ')) return 'Huyện Chương Mỹ';
        if (addr.includes('đan phượng')) return 'Huyện Đan Phượng';
        if (addr.includes('hoài đức')) return 'Huyện Hoài Đức';
        if (addr.includes('mỹ đức')) return 'Huyện Mỹ Đức';
        if (addr.includes('phú xuyên')) return 'Huyện Phú Xuyên';
        if (addr.includes('mê linh')) return 'Huyện Mê Linh';
        if (addr.includes('phúc thọ')) return 'Huyện Phúc Thọ';
        if (addr.includes('quốc oai')) return 'Huyện Quốc Oai';
        if (addr.includes('sóc sơn')) return 'Huyện Sóc Sơn';
        if (addr.includes('thạch thất')) return 'Huyện Thạch Thất';
        if (addr.includes('thường tín')) return 'Huyện Thường Tín';
        if (addr.includes('ứng hòa')) return 'Huyện Ứng Hòa';
        if (addr.includes('thạch thất')) return 'Huyện Thạch Thất';
        if (addr.includes('thanh trì')) return 'Huyện Thanh Trì';
        if (addr.includes('sơn tây')) return 'Thị xã Sơn Tây';

        // 2. KHỐI HỒ CHÍ MINH
        if (addr.includes('thủ đức')) return 'Tp. Thủ Đức';
        if (addr.includes('gò vấp')) return 'Quận Gò Vấp';
        if (addr.includes('bình thạnh')) return 'Quận Bình Thạnh';
        if (addr.includes('tân bình')) return 'Quận Tân Bình';
        if (addr.includes('tân phú')) return 'Quận Tân Phú';
        if (addr.includes('phú nhuận')) return 'Quận Phú Nhuận';
        if (addr.includes('bình tân')) return 'Quận Bình Tân';
        if (addr.includes('bình chánh')) return 'Huyện Bình Chánh';
        if (addr.includes('nhà bè')) return 'Huyện Nhà Bè';
        if (addr.includes('hóc môn')) return 'Huyện Hóc Môn';
        if (addr.includes('củ chi')) return 'Huyện Củ Chi';
        if (addr.includes('cần giờ')) return 'Huyện Cần Giờ';
        
        // 3. QUẬN SỐ (Chung cho cả 2, nhưng chủ yếu là HCM)
        const match = addr.match(/(?:quận|q\.?)\s*(\d+)/);
        if (match) return `Quận ${match[1]}`;

        return null;
    }

    function getTimeTags(hoursStr) {
        let timeTags = [];
        const times = hoursStr.match(/(\d{1,2}):(\d{2})/g);
        if (!times || times.length < 2) return [];

        const parseTime = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h + m / 60;
        };
        const openTime = parseTime(times[0]); 
        const closeTimeStr = times[times.length - 1]; 
        let closeTime = parseTime(closeTimeStr);
        if (closeTime < openTime && closeTime < 12) closeTime += 24; 

        if (openTime <= 9.0) timeTags.push('Ăn sáng');
        if (openTime <= 13.0 && closeTime >= 12.0) timeTags.push('Ăn trưa');
        if (closeTime >= 18.0) timeTags.push('Ăn tối');
        if (closeTime >= 22.0 || closeTime < 5.0) timeTags.push('Ăn đêm');
        return timeTags;
    }

    // --- 2. HÀM PHÂN TÍCH TÊN MÓN (LOGIC V8 - GIỮ NGUYÊN) ---
    function analyzeNameAndGetDish(name) {
        if (!name) return { origins: [], dishes: [] };

        let origins = [];
        let dishes = [];
        const parts = name.split(/-|–|\|/); 
        let segmentsToCheck = [name.toLowerCase()]; 
        parts.forEach(part => {
            const subParts = part.split(/&|,|\/|\+/);
            subParts.forEach(sub => {
                const cleanSub = sub.replace(/\(.*\)/g, "").trim().toLowerCase();
                if (cleanSub.length > 2) segmentsToCheck.push(cleanSub);
            });
        });

        const mapping = [
            { k: ['bún chả giò', 'bún thịt nướng chả giò'], o: 'Món Miền Nam', d: 'Bún chả giò' },
            { k: ['bún thịt nướng'], o: 'Món Miền Nam', d: 'Bún thịt nướng' },
            { k: ['miến cua'], o: 'Món Bắc', d: 'Miến cua' },
            { k: ['miến ngan'], o: 'Món Bắc', d: 'Miến ngan' },
            { k: ['miến gà'], o: 'Món Bắc', d: 'Miến gà' },
            { k: ['miến lươn'], o: 'Món Bắc', d: 'Miến lươn' },
            { k: ['miến trộn'], o: 'Món Bắc', d: 'Miến trộn' },
            { k: ['bánh canh cua'], o: 'Món Miền Nam', d: 'Bánh canh cua' },
            { k: ['bánh canh ghẹ'], o: 'Món Miền Nam', d: 'Bánh canh ghẹ' },
            { k: ['bánh canh cá lóc'], o: 'Món Miền Trung', d: 'Bánh canh cá lóc' },
            { k: ['bánh canh chả cá', 'bánh canh nha trang', 'bánh canh phan rang'], o: 'Món Miền Trung', d: 'Bánh canh chả cá' },
            { k: ['bánh canh trảng bàng'], o: 'Món Miền Nam', d: 'Bánh canh Trảng Bàng' },
            { k: ['phở gà'], o: 'Món Bắc', d: 'Phở gà' },
            { k: ['phở bò'], o: 'Món Bắc', d: 'Phở bò' },
            { k: ['phở cuốn'], o: 'Món Bắc', d: 'Phở cuốn' },
            { k: ['phở trộn'], o: 'Món Bắc', d: 'Phở trộn' },
            { k: ['phở chua'], o: 'Món Bắc', d: 'Phở chua' },
            { k: ['phở bắc', 'phở hà nội', 'nam định', 'phở gia truyền'], o: 'Món Bắc', d: 'Phở Bắc' },
            { k: ['bún chả'], o: 'Món Bắc', d: 'Bún chả' }, 
            { k: ['bún đậu'], o: 'Món Bắc', d: 'Bún đậu mắm tôm' },
            { k: ['bún bò huế', 'bún bò'], o: 'Món Miền Trung', d: 'Bún bò Huế' },
            { k: ['bún mắm'], o: 'Món Miền Tây', d: 'Bún mắm' },
            { k: ['bún riêu'], o: 'Món Bắc', d: 'Bún riêu' },
            { k: ['bún ốc'], o: 'Món Bắc', d: 'Bún ốc' },
            { k: ['bún cá'], o: 'Món Miền Trung', d: 'Bún cá' },
            { k: ['bún sứa'], o: 'Món Miền Trung', d: 'Bún sứa' },
            { k: ['bún nước lèo'], o: 'Món Miền Tây', d: 'Bún nước lèo' },
            { k: ['bún dọc mùng', 'bún mọc'], o: 'Món Bắc', d: 'Bún dọc mùng' },
            { k: ['cơm tấm long xuyên'], o: 'Món Miền Tây', d: 'Cơm tấm Long Xuyên' },
            { k: ['cơm tấm'], o: 'Món Miền Nam', d: 'Cơm tấm' },
            { k: ['cơm gà hội an', 'tam kỳ'], o: 'Món Miền Trung', d: 'Cơm gà Hội An' },
            { k: ['cơm gà xối mỡ'], o: 'Món Hoa/Việt', d: 'Cơm gà xối mỡ' },
            { k: ['cơm gà nha trang'], o: 'Món Miền Trung', d: 'Cơm gà Nha Trang' },
            { k: ['cơm niêu'], o: 'Món Việt', d: 'Cơm niêu' },
            { k: ['cơm văn phòng', 'cơm trưa'], o: null, d: 'Cơm văn phòng' },
            { k: ['hủ tiếu nam vang'], o: 'Món Miền Tây', d: 'Hủ tiếu Nam Vang' },
            { k: ['hủ tiếu sa đéc'], o: 'Món Miền Tây', d: 'Hủ tiếu Sa Đéc' },
            { k: ['hủ tiếu mỹ tho'], o: 'Món Miền Tây', d: 'Hủ tiếu Mỹ Tho' },
            { k: ['hủ tiếu hồ'], o: 'Món Hoa', d: 'Hủ tiếu Hồ' },
            { k: ['hủ tiếu', 'hủ tíu'], o: 'Món Miền Tây', d: 'Hủ tiếu' },
            { k: ['mì quảng'], o: 'Món Miền Trung', d: 'Mì Quảng' },
            { k: ['cao lầu'], o: 'Món Miền Trung', d: 'Cao lầu' },
            { k: ['bánh xèo miền tây'], o: 'Món Miền Tây', d: 'Bánh xèo Miền Tây' },
            { k: ['bánh xèo'], o: 'Món Miền Nam', d: 'Bánh xèo' },
            { k: ['bánh khọt'], o: 'Món Miền Nam', d: 'Bánh khọt' },
            { k: ['bánh cuốn'], o: 'Món Bắc', d: 'Bánh cuốn' },
            { k: ['bánh bèo', 'bánh nậm', 'bánh bột lọc', 'bánh huế'], o: 'Món Miền Trung', d: 'Bánh Huế' },
            { k: ['bánh tằm'], o: 'Món Miền Tây', d: 'Bánh tằm' },
            { k: ['bánh mì'], o: 'Món Miền Nam', d: 'Bánh mì' },
            { k: ['nem nướng'], o: 'Món Miền Trung', d: 'Nem nướng Nha Trang' },
            { k: ['nem chua rán'], o: 'Món Bắc', d: 'Nem chua rán' },
            { k: ['chả cá lã vọng'], o: 'Món Bắc', d: 'Chả cá Lã Vọng' },
            { k: ['xôi xéo', 'xôi hà nội'], o: 'Món Bắc', d: 'Xôi Bắc' },
            { k: ['gỏi cuốn', 'bò bía'], o: 'Món Miền Nam', d: 'Gỏi cuốn' },
            { k: ['bò kho'], o: 'Món Miền Nam', d: 'Bò kho' },
            { k: ['cháo lòng'], o: 'Món Việt', d: 'Cháo lòng' },
            { k: ['lẩu mắm'], o: 'Món Miền Tây', d: 'Lẩu mắm' },
            { k: ['ốc', 'ngêu', 'sò'], o: null, d: 'Ốc' },
            { k: ['hải sản'], o: null, d: 'Hải sản' },
            { k: ['lẩu'], o: null, d: 'Lẩu' },
            { k: ['nướng', 'bbq'], o: null, d: 'Món nướng' },
            { k: ['chè'], o: null, d: 'Chè' },
            { k: ['tàu hũ', 'tàu phớ'], o: null, d: 'Tàu hũ' },
            { k: ['trà sữa'], o: null, d: 'Trà sữa' },
            { k: ['chay'], o: null, d: 'Đồ chay' }
        ];

        segmentsToCheck.forEach(segment => {
            mapping.forEach(item => {
                const hasKeyword = item.k.some(key => segment.includes(key));
                if (hasKeyword) {
                    if (item.d === 'Bún chả' && segment.includes('giò')) return; 
                    if (item.o) origins.push(item.o);
                    if (item.d) dishes.push(item.d);
                }
            });
        });

        const fullNameCheck = name.toLowerCase();
        if (fullNameCheck.includes('miền tây') && origins.length === 0) origins.push('Món Miền Tây');
        if (fullNameCheck.includes('hà nội') && origins.length === 0) origins.push('Món Bắc');
        if (fullNameCheck.includes('huế') && origins.length === 0) origins.push('Món Miền Trung');
        
        return {
            origins: [...new Set(origins)],
            dishes: [...new Set(dishes)]
        };
    }

    // --- 3. HÀM TỔNG HỢP TAGS ---
    function generateOrderedTags(res, standardizedPrice) {
        const addr = (res.diaChi || "").toLowerCase();
        const nameLower = (res.tenQuan || "").toLowerCase();

        // --- NHÓM 1: VỊ TRÍ ---
        let locationTags = [];
        if (addr.includes('hà nội')) locationTags.push('Hà Nội');
        else if (addr.includes('hcm') || addr.includes('hồ chí minh') || addr.includes('quận')) locationTags.push('Hồ Chí Minh');
        
        const districtTag = getDistrict(res.diaChi);
        if (districtTag) locationTags.push(districtTag);

        // --- NHÓM 2 & 3: XUẤT XỨ & TÊN MÓN ---
        const foodInfo = analyzeNameAndGetDish(res.tenQuan);
        
        // --- NHÓM 4: KHÔNG GIAN & RANDOM ĐIỂM GIẢ LẬP ---
        let spaceTags = [];
        let maxPrice = 0;
        const cleanPrice = standardizedPrice.replace(/\./g, '');
        const numbers = cleanPrice.match(/\d+/g);
        if (numbers) maxPrice = Math.max(...numbers.map(n => parseInt(n)));

        if (nameLower.includes('rooftop') || nameLower.includes('tầng thượng')) spaceTags.push('Rooftop', 'View đẹp');
        if (nameLower.includes('sân vườn') || nameLower.includes('garden')) spaceTags.push('Sân vườn', 'Thiên nhiên', 'Thoáng mát');
        if (addr.includes('hẻm') || addr.includes('ngách') || addr.includes('cư xá')) spaceTags.push('Trong hẻm', 'Yên tĩnh');

        // [MỚI] RANDOM ĐIỂM NẾU CHƯA CÓ (để fix lỗi chỉ ra tags Bình dân)
        let diemKg = res.diemKhongGian;
        let diemPv = res.diemPhucVu;
        if (!diemKg) diemKg = (Math.random() * (9.5 - 6.0) + 6.0).toFixed(1);
        if (!diemPv) diemPv = (Math.random() * (9.5 - 6.0) + 6.0).toFixed(1);
        diemKg = parseFloat(diemKg);
        diemPv = parseFloat(diemPv);

        if (diemKg >= 8.5) {
            if (maxPrice >= 200000) spaceTags.push('Sang trọng', 'Decor đẹp', 'Máy lạnh');
            else spaceTags.push('Không gian đẹp', 'Sạch sẽ', 'Thoáng mát');
        } else if (diemKg >= 7.0) {
            spaceTags.push('Lịch sự', 'Ấm cúng');
            if (maxPrice > 50000) spaceTags.push('Máy lạnh');
        } else {
            if (maxPrice < 60000 && !spaceTags.includes('Sang trọng')) spaceTags.push('Bình dân', 'Vỉa hè');
            else spaceTags.push('Bình dân', 'Thoải mái');
        }

        // --- NHÓM 5: NHU CẦU ---
        let needTags = [];
        if (spaceTags.includes('Sang trọng') && diemPv >= 8.0) needTags.push('Tiếp khách', 'Doanh nhân');
        if (diemKg >= 8.0 && (spaceTags.includes('Sang trọng') || spaceTags.includes('Rooftop') || spaceTags.includes('Ấm cúng') || spaceTags.includes('View đẹp'))) needTags.push('Hẹn hò', 'Lãng mạn');
        
        if (nameLower.includes('lẩu') || nameLower.includes('nướng') || nameLower.includes('ốc') || nameLower.includes('bia') || foodInfo.dishes.includes('Lẩu') || foodInfo.dishes.includes('Món nướng')) needTags.push('Tụ tập', 'Nhậu', 'Nhóm hội');
        
        const timeTags = getTimeTags(res.gioMoCua || "");
        if ((nameLower.includes('cơm') || nameLower.includes('bếp') || foodInfo.dishes.includes('Cơm tấm') || foodInfo.dishes.includes('Cơm văn phòng')) && timeTags.includes('Ăn trưa')) {
            needTags.push('Cơm văn phòng', 'Bữa trưa');
        }

        if (nameLower.includes('bánh mì') || nameLower.includes('xôi') || nameLower.includes('take away')) needTags.push('Ăn nhanh', 'Tiện lợi');
        if (diemKg >= 7.0 && !needTags.includes('Nhậu') && !spaceTags.includes('Vỉa hè')) needTags.push('Gia đình', 'Trẻ em');
        if (nameLower.includes('chay') || nameLower.includes('healthy')) needTags.push('Healthy', 'Thanh tịnh');

        let extraTags = [...timeTags];

        return [
            ...locationTags,
            ...foodInfo.origins,
            ...foodInfo.dishes,
            ...spaceTags,
            ...needTags,
            ...extraTags
        ];
    }

    // --- THỰC THI ---
    const updatedRestaurants = restaurants.map(res => {
        const newPriceStr = normalizePrice(res.giaCa);
        const cleanHours = cleanOpeningHours(res.gioMoCua);
        const orderedTags = [...new Set(generateOrderedTags(res, newPriceStr))];

        return {
            ...res,
            giaCa: newPriceStr,
            gioMoCua: cleanHours,
            tags: orderedTags
        };
    });

    fs.writeFileSync('vietnomnom_tagged.json', JSON.stringify(updatedRestaurants, null, 2), 'utf8');
    console.log('✅ Đã xong V8! Đã cập nhật Quận Hà Nội & Fix tags không gian.');

} catch (err) {
    console.error('Lỗi:', err.message);
}