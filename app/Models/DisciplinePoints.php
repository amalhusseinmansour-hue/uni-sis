<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisciplinePoints extends Model
{
    use HasFactory;

    protected $table = 'discipline_points';

    protected $fillable = [
        'student_id',
        'semester_id',
        'total_points',
        'active_points',
        'expired_points',
        'reduced_points',
        'warning_1_issued',
        'warning_1_issued_at',
        'warning_2_issued',
        'warning_2_issued_at',
        'suspension_issued',
        'suspension_issued_at',
        'expulsion_recommended',
        'expulsion_recommended_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'warning_1_issued' => 'boolean',
            'warning_1_issued_at' => 'datetime',
            'warning_2_issued' => 'boolean',
            'warning_2_issued_at' => 'datetime',
            'suspension_issued' => 'boolean',
            'suspension_issued_at' => 'datetime',
            'expulsion_recommended' => 'boolean',
            'expulsion_recommended_at' => 'datetime',
        ];
    }

    // Point thresholds
    const WARNING_1_THRESHOLD = 10;
    const WARNING_2_THRESHOLD = 20;
    const SUSPENSION_THRESHOLD = 30;
    const EXPULSION_THRESHOLD = 50;

    // ==========================================
    // Relationships
    // ==========================================

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeBySemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeCritical($query)
    {
        return $query->where('total_points', '>=', self::EXPULSION_THRESHOLD);
    }

    public function scopeOnProbation($query)
    {
        return $query->where('total_points', '>=', self::SUSPENSION_THRESHOLD)
            ->where('total_points', '<', self::EXPULSION_THRESHOLD);
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            'GOOD_STANDING' => 'Good Standing',
            'WARNING_1' => 'First Warning',
            'WARNING_2' => 'Second Warning',
            'PROBATION' => 'Probation',
            'CRITICAL' => 'Critical',
            default => $this->status,
        };
    }

    public function getStatusDisplayArAttribute(): string
    {
        return match ($this->status) {
            'GOOD_STANDING' => 'وضع جيد',
            'WARNING_1' => 'إنذار أول',
            'WARNING_2' => 'إنذار ثاني',
            'PROBATION' => 'مراقبة',
            'CRITICAL' => 'حرج',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'GOOD_STANDING' => 'green',
            'WARNING_1' => 'yellow',
            'WARNING_2' => 'orange',
            'PROBATION' => 'red',
            'CRITICAL' => 'red',
            default => 'gray',
        };
    }

    public function getPointsToNextThresholdAttribute(): ?int
    {
        return match (true) {
            $this->total_points < self::WARNING_1_THRESHOLD => self::WARNING_1_THRESHOLD - $this->total_points,
            $this->total_points < self::WARNING_2_THRESHOLD => self::WARNING_2_THRESHOLD - $this->total_points,
            $this->total_points < self::SUSPENSION_THRESHOLD => self::SUSPENSION_THRESHOLD - $this->total_points,
            $this->total_points < self::EXPULSION_THRESHOLD => self::EXPULSION_THRESHOLD - $this->total_points,
            default => null,
        };
    }

    public function getNextThresholdNameAttribute(): ?string
    {
        return match (true) {
            $this->total_points < self::WARNING_1_THRESHOLD => 'First Warning',
            $this->total_points < self::WARNING_2_THRESHOLD => 'Second Warning',
            $this->total_points < self::SUSPENSION_THRESHOLD => 'Suspension',
            $this->total_points < self::EXPULSION_THRESHOLD => 'Expulsion',
            default => null,
        };
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    public function addPoints(int $points): void
    {
        $this->total_points += $points;
        $this->active_points += $points;
        $this->updateStatus();
        $this->save();
    }

    public function reducePoints(int $points, string $reason = null): void
    {
        $reduction = min($points, $this->active_points);
        $this->active_points -= $reduction;
        $this->reduced_points += $reduction;
        $this->updateStatus();

        if ($reason) {
            $this->notes = ($this->notes ? $this->notes . "\n" : '') .
                "[" . now()->format('Y-m-d') . "] Reduced {$reduction} points: {$reason}";
        }

        $this->save();
    }

    public function expirePoints(int $points): void
    {
        $expiration = min($points, $this->active_points);
        $this->active_points -= $expiration;
        $this->expired_points += $expiration;
        $this->updateStatus();
        $this->save();
    }

    public function updateStatus(): void
    {
        $points = $this->total_points;

        // Check thresholds and issue warnings/actions
        if ($points >= self::EXPULSION_THRESHOLD && !$this->expulsion_recommended) {
            $this->status = 'CRITICAL';
            $this->expulsion_recommended = true;
            $this->expulsion_recommended_at = now();
        } elseif ($points >= self::SUSPENSION_THRESHOLD && !$this->suspension_issued) {
            $this->status = 'PROBATION';
            $this->suspension_issued = true;
            $this->suspension_issued_at = now();
        } elseif ($points >= self::WARNING_2_THRESHOLD && !$this->warning_2_issued) {
            $this->status = 'WARNING_2';
            $this->warning_2_issued = true;
            $this->warning_2_issued_at = now();
        } elseif ($points >= self::WARNING_1_THRESHOLD && !$this->warning_1_issued) {
            $this->status = 'WARNING_1';
            $this->warning_1_issued = true;
            $this->warning_1_issued_at = now();
        } elseif ($points < self::WARNING_1_THRESHOLD) {
            $this->status = 'GOOD_STANDING';
        }
    }

    public static function getOrCreateForStudent(int $studentId, ?int $semesterId = null): self
    {
        $semesterId = $semesterId ?? Semester::getCurrentSemester()?->id;

        return self::firstOrCreate(
            ['student_id' => $studentId, 'semester_id' => $semesterId],
            [
                'total_points' => 0,
                'active_points' => 0,
                'expired_points' => 0,
                'reduced_points' => 0,
                'status' => 'GOOD_STANDING',
            ]
        );
    }

    public function recalculateFromIncidents(): void
    {
        $totalPoints = DisciplineIncident::where('student_id', $this->student_id)
            ->where('semester_id', $this->semester_id)
            ->whereIn('status', ['CONFIRMED', 'RESOLVED'])
            ->sum('points');

        $this->total_points = $totalPoints;
        $this->active_points = max(0, $totalPoints - $this->expired_points - $this->reduced_points);
        $this->updateStatus();
        $this->save();
    }
}
