use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use rand::{Rng, SeedableRng};
use rand::rngs::StdRng;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct SudokuCore {
    cells: Vec<u8>, // 0 represents empty
}

#[wasm_bindgen]
impl SudokuCore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            cells: vec![0; 81],
        }
    }

    pub fn get_board(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.cells).unwrap()
    }

    pub fn set_board(&mut self, board: Vec<u8>) {
        if board.len() == 81 {
            self.cells = board;
        }
    }

    pub fn solve(&mut self) -> bool {
        self.backtrack(0)
    }

    pub fn generate_with_seed(&mut self, seed_str: &str, difficulty: &str) -> JsValue {
        // Simple hash for seed string
        let mut seed = [0u8; 32];
        let bytes = seed_str.as_bytes();
        for i in 0..bytes.len().min(32) {
            seed[i] = bytes[i];
        }
        
        let mut rng = StdRng::from_seed(seed);
        
        // 1. Start with empty board
        self.cells = vec![0; 81];
        
        // 2. Fill diagonal 3x3 blocks (independent)
        for i in (0..9).step_by(3) {
            self.fill_box(i, i, &mut rng);
        }
        
        // 3. Solve the rest to get a complete valid board
        self.solve();
        
        // 4. Remove digits based on difficulty
        let remove_count = match difficulty {
            "Zen" => 30,    // Easy
            "Focus" => 45,  // Medium
            "Master" => 55, // Hard
            _ => 40,
        };
        
        self.remove_digits(remove_count, &mut rng);

        self.get_board()
    }

    pub fn validate_move(&self, index: usize, value: u8) -> bool {
        if index >= 81 || value < 1 || value > 9 {
            return false;
        }
        
        let row = index / 9;
        let col = index % 9;
        
        // Check row
        for i in 0..9 {
            if i != col && self.cells[row * 9 + i] == value {
                return false;
            }
        }
        
        // Check column
        for i in 0..9 {
            if i != row && self.cells[i * 9 + col] == value {
                return false;
            }
        }
        
        // Check 3x3 box
        let start_row = (row / 3) * 3;
        let start_col = (col / 3) * 3;
        for i in 0..3 {
            for j in 0..3 {
                let r = start_row + i;
                let c = start_col + j;
                if (r != row || c != col) && self.cells[r * 9 + c] == value {
                    return false;
                }
            }
        }
        
        true
    }

    // Helper methods (not exported to JS)
    
    fn backtrack(&mut self, index: usize) -> bool {
        if index == 81 {
            return true;
        }
        
        if self.cells[index] != 0 {
            return self.backtrack(index + 1);
        }
        
        for num in 1..=9 {
            if self.is_safe(index, num) {
                self.cells[index] = num;
                if self.backtrack(index + 1) {
                    return true;
                }
                self.cells[index] = 0;
            }
        }
        
        false
    }
    
    fn is_safe(&self, index: usize, num: u8) -> bool {
        let row = index / 9;
        let col = index % 9;
        
        for i in 0..9 {
            if self.cells[row * 9 + i] == num || self.cells[i * 9 + col] == num {
                return false;
            }
        }
        
        let start_row = (row / 3) * 3;
        let start_col = (col / 3) * 3;
        for i in 0..3 {
            for j in 0..3 {
                if self.cells[(start_row + i) * 9 + (start_col + j)] == num {
                    return false;
                }
            }
        }
        
        true
    }
    
    fn fill_box(&mut self, row: usize, col: usize, rng: &mut StdRng) {
        let mut nums: Vec<u8> = (1..=9).collect();
        for i in 0..3 {
            for j in 0..3 {
                let r_idx = rng.gen_range(0..nums.len());
                self.cells[(row + i) * 9 + (col + j)] = nums.remove(r_idx);
            }
        }
    }
    
    fn remove_digits(&mut self, count: u8, rng: &mut StdRng) {
        let mut removed = 0;
        while removed < count {
            let idx = rng.gen_range(0..81);
            if self.cells[idx] != 0 {
                self.cells[idx] = 0;
                removed += 1;
            }
        }
    }
}
